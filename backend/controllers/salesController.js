import * as salesService from '../services/salesService.js';
import * as orderService from '../services/orderService.js';

const getDashboard = async (req, res) => {
    try {
        const data = await salesService.getSalesDashboardStats();
        res.json(data);
    } catch (err) {
        console.error("Error fetching sales dashboard:", err);
        res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
};

const getCustomers = async (req, res) => {
    try {
        const customers = await salesService.getCustomerStats();
        res.json({ customers });
    } catch (err) {
        console.error("Error fetching customers:", err);
        res.status(500).json({ error: "Failed to fetch customers" });
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

const getPendingVerifications = async (req, res) => {
    try {
        const verifications = await salesService.getPendingVerifications();
        res.json(verifications);
    } catch (err) {
        console.error("Error fetching pending verifications:", err);
        res.status(500).json({ error: "Failed to fetch pending verifications" });
    }
};

const getPendingPayments = async (req, res) => {
    try {
        const payments = await salesService.getPendingPayments();
        res.json(payments);
    } catch (err) {
        console.error("Error fetching pending payments:", err);
        res.status(500).json({ error: "Failed to fetch pending payments" });
    }
};

const verifyOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, verifiedBy } = req.body;
        
        const result = await salesService.verifyOrder(id, action, verifiedBy, req.user.id);
        res.json({ message: `Order ${action}d successfully`, result });
    } catch (err) {
        console.error("Error verifying order:", err);
        res.status(500).json({ error: "Failed to verify order" });
    }
};

const sendConfirmation = async (req, res) => {
    try {
        const { orderId, type, sentBy, customMessage } = req.body;
        
        const result = await salesService.sendConfirmation(orderId, type, sentBy, req.user.id, customMessage);
        res.json({ message: "Confirmation sent successfully", result });
    } catch (err) {
        console.error("Error sending confirmation:", err);
        res.status(500).json({ error: "Failed to send confirmation" });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, delivered_by, delivery_contact_number } = req.body;
        
        const result = await orderService.updateOrderStatus(id, status, delivered_by, delivery_contact_number);
        
        if (result && status === 'DELIVERED') {
            try {
                // Send notification to customer
                await salesService.sendConfirmation(id, 'delivery_update', req.user.name, req.user.id);
            } catch (notifyErr) {
                console.error("Failed to send delivery update notification:", notifyErr);
                // Don't fail the whole request if only notification fails
            }
        }
        
        res.json({ message: "Order status updated successfully", result });
    } catch (err) {
        console.error("Error updating order status:", err);
        res.status(500).json({ error: "Failed to update order status" });
    }
};

const getDashboardView = (req, res) => {
    res.json({
        message: "Salesperson Dashboard",
        user: req.user,
        stats: {
            totalSales: 0,
            monthlySales: 0,
            customers: 0
        }
    });
};

const getCustomersView = (req, res) => {
    res.json({
        message: "Customer management data",
        user: req.user
    });
};

export {
    getDashboard,
    getCustomers,
    getOrders,
    getPendingVerifications,
    getPendingPayments,
    verifyOrder,
    sendConfirmation,
    updateOrderStatus,
    getDashboardView,
    getCustomersView
};
