import * as reportService from '../services/reportService.js';

const getSalesReport = async (req, res) => {
    const { startDate, endDate } = req.query;
    console.log("Fetching sales report:", { startDate, endDate });
    try {
        const reportData = await reportService.getSalesReport(startDate, endDate);
        console.log("Sales report fetched successfully");
        res.json({ report: reportData.dailySales, activeCustomers: reportData.activeCustomers });
    } catch (err) {
        console.error("Error fetching sales report:", err);
        res.status(500).json({ error: "Failed to fetch report" });
    }
};

const getInventoryReport = async (req, res) => {
    console.log("Fetching inventory report");
    try {
        const report = await reportService.getInventoryReport();
        console.log("Inventory report fetched successfully");
        res.json(report);
    } catch (err) {
        console.error("Error fetching inventory report:", err);
        res.status(500).json({ error: "Failed to fetch report" });
    }
};

const getSupplierReport = async (req, res) => {
    console.log("Fetching supplier report");
    try {
        const report = await reportService.getSupplierReport();
        console.log("Supplier report fetched successfully");
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
