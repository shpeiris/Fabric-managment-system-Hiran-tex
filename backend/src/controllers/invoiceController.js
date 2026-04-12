import invoiceService from '../services/invoiceService.js';

export const generateInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;
        const invoice = await invoiceService.generateInvoice(orderId);
        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getInvoices = async (req, res) => {
    try {
        const invoices = await invoiceService.getInvoices();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getInvoiceByOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const invoice = await invoiceService.getInvoiceByOrderId(orderId);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found for this order' });
        }
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
