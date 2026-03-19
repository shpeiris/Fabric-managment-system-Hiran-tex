import * as reportService from '../services/reportService.js';

const getSalesReport = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const report = await reportService.getSalesReport(startDate, endDate);
        res.json({ report });
    } catch (err) {
        console.error("Error fetching sales report:", err);
        res.status(500).json({ error: "Failed to fetch report" });
    }
};

const getInventoryReport = async (req, res) => {
    try {
        const report = await reportService.getInventoryReport();
        res.json(report);
    } catch (err) {
        console.error("Error fetching inventory report:", err);
        res.status(500).json({ error: "Failed to fetch report" });
    }
};

const getSupplierReport = async (req, res) => {
    try {
        const report = await reportService.getSupplierReport();
        res.json(report);
    } catch (err) {
        console.error("Error fetching supplier report:", err);
        res.status(500).json({ error: "Failed to fetch report" });
    }
};

export {
    getSalesReport,
    getInventoryReport,
    getSupplierReport
};
