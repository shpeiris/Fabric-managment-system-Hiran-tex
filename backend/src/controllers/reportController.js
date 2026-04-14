import * as reportService from '../services/reportService.js';

const getSalesReport = async (req, res) => {
    const { startDate, endDate } = req.query;
    console.log("Fetching sales report:", { startDate, endDate });
    try {
        const reportData = await reportService.getSalesReport(startDate, endDate);
        console.log("Sales report fetched successfully");
        
        // Send the full report data structure expected by the frontend
        res.json({
            summary: reportData.summary,
            report: reportData.dailySales,
            detailedOrders: reportData.detailedOrders,
            activeCustomers: reportData.summary.uniqueCustomers,
            pendingOrders: reportData.detailedOrders.filter(o => o.order_status === 'PENDING' || o.order_status === 'PROCESSING').length
        });
    } catch (err) {
        console.error("Error fetching sales report:", err);
        res.status(500).json({ error: "Failed to fetch report" });
    }
};

const getInventoryReport = async (req, res) => {
    const { startDate, endDate } = req.query;
    console.log("Fetching inventory report:", { startDate, endDate });
    try {
        const report = await reportService.getInventoryReport(startDate, endDate);
        console.log("Inventory report fetched successfully");
        res.json(report);
    } catch (err) {
        console.error("Error fetching inventory report:", err);
        res.status(500).json({ error: "Failed to fetch report" });
    }
};

const getSupplierReport = async (req, res) => {
    const { startDate, endDate } = req.query;
    console.log("Fetching supplier report:", { startDate, endDate });
    try {
        const report = await reportService.getSupplierReport(startDate, endDate);
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
