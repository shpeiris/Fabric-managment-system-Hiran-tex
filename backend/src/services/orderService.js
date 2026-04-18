import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

const logOrderStatusHistory = async (orderId, oldStatus, newStatus, changedBy = {}) => {
    const { name, id } = changedBy;
    const query = `
        INSERT INTO order_status_history (order_id, old_status, new_status, changed_by_name, changed_by_id)
        VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(query, [orderId, oldStatus, newStatus, name || 'System', id || null]);
};

const getUserOrders = async (userId) => {
    const query = `
      SELECT o.order_id, o.customer_name, o.order_status, o.total_amount, 
             o.delivery_address, o.delivery_type, o.order_date,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count,
             p.payment_status as latest_payment_status,
             p.bank_slip_url
      FROM orders o
      LEFT JOIN (
          SELECT DISTINCT ON (order_id) order_id, payment_status, bank_slip_url
          FROM payments
          ORDER BY order_id, payment_date DESC
      ) p ON o.order_id = p.order_id
      WHERE o.customer_id = $1
      ORDER BY o.order_date DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

const getOrderById = async (orderId, userId = null) => {
    let query = `
        SELECT o.*, 
               p.payment_status, 
               p.payment_method, 
               p.bank_slip_url, 
               p.payment_id,
               p.amount as paid_amount,
               f.feedback_id,
               f.overall_rating,
               f.fabric_quality,
               f.delivery,
               f.customer_service,
               f.comments as feedback_comments,
               f.created_at as feedback_date,
               inv.invoice_id
        FROM orders o
        LEFT JOIN (
            SELECT DISTINCT ON (order_id) *
            FROM payments
            ORDER BY order_id, payment_date DESC
        ) p ON o.order_id = p.order_id
        LEFT JOIN feedback f ON o.order_id = f.order_id
        LEFT JOIN invoices inv ON o.order_id = inv.order_id
        WHERE o.order_id = $1
    `;
    let params = [orderId];

    if (userId) {
        query += " AND o.customer_id = $2";
        params.push(userId);
    }

    const orderResult = await pool.query(query, params);
    if (orderResult.rows.length === 0) return null;

    const itemsResult = await pool.query(
        `SELECT oi.*, f.name as fabric_name, f.price_per_meter 
         FROM order_items oi 
         JOIN fabrics f ON oi.fabric_id = f.fabric_id 
         WHERE oi.order_id = $1`,
        [orderId]
    );

    return { order: orderResult.rows[0], items: itemsResult.rows };
};

const getOrders = async (filters) => {
    const { order_status, customer_id } = filters;
    let query = `
    SELECT o.*, 
           CASE 
             WHEN o.customer_id IS NOT NULL THEN (SELECT full_name FROM customers WHERE customer_id = o.customer_id)
             ELSE o.customer_name 
           END as customer_name,
           p.payment_id, p.payment_status, p.payment_method, p.bank_slip_url,
           fb.overall_rating as feedback_rating,
           fb.comments as feedback_comments,
           inv.invoice_id
    FROM orders o
    LEFT JOIN payments p ON o.order_id = p.order_id
    LEFT JOIN feedback fb ON o.order_id = fb.order_id
    LEFT JOIN invoices inv ON o.order_id = inv.order_id
    WHERE 1=1
  `;
    const params = [];
    let paramCount = 0;

    if (order_status) {
        paramCount++;
        query += ` AND o.order_status = $${paramCount}`;
        params.push(order_status);
    }

    if (customer_id) {
        paramCount++;
        query += ` AND o.customer_id = $${paramCount}`;
        params.push(customer_id);
    }

    query += " ORDER BY o.order_date DESC";

    const result = await pool.query(query, params);
    return result.rows;
};

const createOrder = async (orderData) => {
    const { customer_id, items, delivery_address, delivery_type, payment_method, customer_name, phone_number, special_instructions } = orderData;

    try {
        await pool.query('BEGIN');

        let totalAmount = 0;
        const processedItems = [];

        // Calculate true total from currently available prices
        for (const item of items) {
            const fabricResult = await pool.query("SELECT price_per_meter, stock_quantity, stock_available_quantity FROM fabrics WHERE fabric_id = $1", [item.fabric_id]);
            if (fabricResult.rows.length === 0) throw new Error(`Fabric ${item.fabric_id} not found`);

            const fabric = fabricResult.rows[0];
            const stockAvailable = parseFloat(fabric.stock_available_quantity);
            const requestedQty = parseFloat(item.quantity);

            if (stockAvailable < requestedQty) throw new Error(`Insufficient stock for fabric ID ${item.fabric_id}`);

            const itemTotal = parseFloat(fabric.price_per_meter) * requestedQty;
            totalAmount += itemTotal;
            processedItems.push({
                fabric_id: item.fabric_id,
                quantity: requestedQty,
                unit_price: parseFloat(fabric.price_per_meter),
                total_price: itemTotal
            });
        }

        // Add delivery fee based on type
        if (delivery_type === 'GAMPAHA') {
            totalAmount += 500;
        } else if (delivery_type === 'OUT_OF_GAMPAHA') {
            totalAmount += 750;
        } else if (delivery_type === 'HOME_DELIVERY' || delivery_type === 'STANDARD') {
            // Fallback for legacy types if any
            totalAmount += 500;
        }

        let finalCustomerId = customer_id || null;

        // Auto-register walk-in customer if no customer_id is provided but we have a name
        if (!finalCustomerId && customer_name) {
            let existingCustomer = false;
            
            // Basic check to see if walk-in already exists by phone number
            if (phone_number) {
                 const phoneCheck = await pool.query("SELECT customer_id FROM customers WHERE tel = $1 LIMIT 1", [phone_number]);
                 if (phoneCheck.rows.length > 0) {
                      finalCustomerId = phoneCheck.rows[0].customer_id;
                      existingCustomer = true;
                 }
            }
            
            if (!existingCustomer) {
                const tempEmail = `${phone_number || Math.floor(Math.random()*10000)}_walkin@system.local`;
                const hashedPwd = await bcrypt.hash('Walkin123!', 10);
                
                const newCustomer = await pool.query(
                    `INSERT INTO customers (full_name, email, password, tel, address)
                     VALUES ($1, $2, $3, $4, $5) RETURNING customer_id`,
                    [
                        customer_name,
                        tempEmail,
                        hashedPwd,
                        phone_number || '0000000000',
                        delivery_address || 'Store Walk-in'
                    ]
                );
                finalCustomerId = newCustomer.rows[0].customer_id;
            }
        }

        // Determine order source: ONLINE if a real customer placed it, IN_STORE for walk-in
        const orderSource = customer_id ? 'ONLINE' : 'IN_STORE';

        // Insert order with all fields
        const orderResult = await pool.query(
            "INSERT INTO orders (customer_id, customer_name, phone_number, total_amount, delivery_address, delivery_type, special_instructions, order_status, order_source) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8) RETURNING order_id",
            [finalCustomerId, customer_name || '', phone_number || '', totalAmount, delivery_address, delivery_type, special_instructions || '', orderSource]
        );


        const orderId = orderResult.rows[0].order_id;

        // Log initial PENDING status
        await logOrderStatusHistory(orderId, null, 'PENDING', { 
            name: customer_name || 'Customer', 
            id: finalCustomerId 
        });

        // Insert order items
        for (const item of processedItems) {
            await pool.query(
                "INSERT INTO order_items (order_id, fabric_id, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5)",
                [orderId, item.fabric_id, item.quantity, item.unit_price, item.total_price]
            );

            // Deduct stock (ensure stock is available)
            await pool.query(
                "UPDATE fabrics SET stock_quantity = stock_quantity - $1, stock_available_quantity = stock_available_quantity - $1 WHERE fabric_id = $2",
                [item.quantity, item.fabric_id]
            );
        }

        // Create Payment record if method specified
        if (payment_method) {
            await pool.query(
                "INSERT INTO payments (order_id, payment_method, payment_status, amount) VALUES ($1, $2, 'PENDING', $3)",
                [orderId, payment_method, totalAmount]
            );
        }

        // Clear cart
        await pool.query("DELETE FROM cart WHERE customer_id = $1", [customer_id]);

        await pool.query('COMMIT');
        return { order_id: orderId };
    } catch (err) {
        await pool.query('ROLLBACK');
        throw err;
    }
};

const updateOrderStatus = async (orderId, order_status, deliveredBy = null, deliveryContactNumber = null, trackingId = null, actor = {}) => {
    // Get current status before update
    const currentOrder = await pool.query("SELECT order_status FROM orders WHERE order_id = $1", [orderId]);
    const oldStatus = currentOrder.rows.length > 0 ? currentOrder.rows[0].order_status : null;

    let query = "UPDATE orders SET order_status = $1";
    const params = [order_status, orderId];
    let paramIndex = 3;

    if (deliveredBy) {
        query += `, delivered_by = $${paramIndex++}`;
        params.push(deliveredBy);
    }
    if (deliveryContactNumber) {
        query += `, delivery_contact_number = $${paramIndex++}`;
        params.push(deliveryContactNumber);
    }
    if (trackingId) {
        query += `, tracking_id = $${paramIndex++}`;
        params.push(trackingId);
    }

    query += " WHERE order_id = $2 RETURNING *";

    const result = await pool.query(query, params);
    if (result.rows.length === 0) return null;

    // Log the transition
    if (oldStatus !== order_status) {
        await logOrderStatusHistory(orderId, oldStatus, order_status, actor);
    }

    return result.rows[0];
};

const getOrderStatusHistory = async (orderId) => {
    const query = `
        SELECT * FROM order_status_history 
        WHERE order_id = $1 
        ORDER BY created_at ASC
    `;
    const result = await pool.query(query, [orderId]);
    return result.rows;
};

export {
    getUserOrders,
    getOrderById,
    getOrders,
    createOrder,
    updateOrderStatus,
    getOrderStatusHistory
};
