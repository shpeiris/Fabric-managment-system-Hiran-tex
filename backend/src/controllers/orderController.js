import * as orderService from '../services/orderService.js';
import * as salesService from '../services/salesService.js';


const getUserOrders = async (req, res) => {
    try {
        const orders = await orderService.getUserOrders(req.user.id);
        res.json({ orders });
    } catch (err) {
        console.error("Error fetching user orders:", err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};

const getOrderById = async (req, res) => {
    const orderId = req.params.id;
    try {
        // If not admin/sales, enforce user ownership
        const userId = (req.user.role === 'ADMIN' || req.user.role === 'SALESPERSON') ? null : req.user.id;

        const result = await orderService.getOrderById(orderId, userId);

        // If result is null, either not found or not owned by user (if userId enforced)
        if (!result) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json(result);
    } catch (err) {
        console.error("Error fetching order details:", err);
        res.status(500).json({ error: "Failed to fetch order details" });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await orderService.getOrders(req.query);
        res.json({ orders });
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};

const createOrder = async (req, res) => {
    const { customer_id, customer_name, items, delivery_address, delivery_type, payment_method } = req.body;

    if ((!customer_id && !customer_name) || !items || items.length === 0) {
        return res.status(400).json({ error: "Customer ID or Name, and items are required" });
    }

    try {
        const result = await orderService.createOrder(req.body);
        // logActivity(req.user.id, 'CREATE_ORDER', `Created Order #${result.order_id}`, req); // Optional: log if needed
        res.json({ message: "Order placed successfully", order_id: result.order_id });
    } catch (err) {
        console.error("Order processing error:", err);
        // Return detailed error if it's a known logic error (like stock), else 500?
        // The service throws Errors with messages.
        res.status(400).json({ error: err.message || "Failed to process order" });
    }
};

const createCustomerOrder = async (req, res) => {
    const { items, delivery_address, delivery_type, payment_method, customer_name, phone_number, special_instructions } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: "Items are required" });
    }

    if (!delivery_address || !delivery_type) {
        return res.status(400).json({ error: "Delivery address and type are required" });
    }

    try {
        const orderData = {
            customer_id: req.user.id,
            items,
            delivery_address,
            delivery_type,
            payment_method,
            customer_name: customer_name || req.user.name,
            phone_number,
            special_instructions
        };

        const result = await orderService.createOrder(orderData);
        res.json({ message: "Order placed successfully", order_id: result.order_id });
    } catch (err) {
        console.error("Order processing error:", err);
        res.status(400).json({ error: err.message || "Failed to process order" });
    }
};

const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status, delivered_by, delivery_contact_number } = req.body;

    const validStatuses = ['PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    try {
        const result = await orderService.updateOrderStatus(id, status, delivered_by, delivery_contact_number);
        if (!result) return res.status(404).json({ error: "Order not found" });

        if (status === 'DELIVERED') {
            try {
                await salesService.sendConfirmation(id, 'delivery_update', req.user.name, req.user.id);
            } catch (notifyErr) {
                console.error("Failed to send delivery update notification:", notifyErr);
            }
        }

        res.json({ message: "Order status updated successfully" });
    } catch (err) {
        console.error("Error updating order status:", err);
        res.status(500).json({ error: "Failed to update order status" });
    }
};

export {
    getUserOrders,
    getOrderById,
    getOrders,
    createOrder,
    createCustomerOrder,
    updateOrderStatus
};
