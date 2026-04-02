import * as paymentService from '../services/paymentService.js';

const getPayments = async (req, res) => {
    try {
        const payments = await paymentService.getPayments();
        res.json({ payments });
    } catch (err) {
        console.error("Error fetching payments:", err);
        res.status(500).json({ error: "Failed to fetch payments" });
    }
};

const uploadBankSlip = async (req, res) => {
    const { order_id } = req.body;
    let slip_url = req.body.slip_url;

    if (req.file) {
        slip_url = `uploads/slips/${req.file.filename}`;
    }

    if (!order_id || !slip_url) {
        return res.status(400).json({ error: "Order ID and Slip (file or URL) are required" });
    }

    try {
        const result = await paymentService.uploadBankSlip(req.user.id, order_id, slip_url);
        res.json({ ...result, slip_url });
    } catch (err) {
        console.error("Error uploading slip:", err);
        if (err.message === "Order not found") return res.status(404).json({ error: err.message });
        res.status(500).json({ error: "Failed to upload bank slip" });
    }
};

const confirmPayment = async (req, res) => {
    const { payment_id, status, confirmedBy, method } = req.body;
    if (!payment_id || !status) {
        return res.status(400).json({ error: "Payment ID and Status are required" });
    }

    try {
        const result = await paymentService.confirmPayment(payment_id, status, req.user.id, {
            confirmedBy: confirmedBy || 'system',
            method: method || 'manual'
        });
        res.json(result);
    } catch (err) {
        console.error("Error confirming payment:", err);
        res.status(500).json({ error: "Failed to confirm payment" });
    }
};

export {
    getPayments,
    uploadBankSlip,
    confirmPayment
};
