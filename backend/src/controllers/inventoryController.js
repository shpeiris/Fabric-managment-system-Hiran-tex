import * as inventoryService from '../services/inventoryService.js';

const getDashboard = async (req, res) => {
    try {
        const stats = await inventoryService.getDashboardStats();
        res.json({
            stats: stats
        });
    } catch (err) {
        console.error("Dashboard stats error:", err);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
};

const getFabrics = async (req, res) => {
    try {
        const fabrics = await inventoryService.getInventoryFabrics();
        res.json({
            message: "Fabric inventory data",
            user: req.user,
            fabrics: fabrics // Added fabrics to response based on likely usage, original just said "Fabric inventory data" but usually frontend needs data
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch fabrics" });
    }
};

const getInventoryFabrics = async (req, res) => {
    try {
        const fabrics = await inventoryService.getInventoryFabrics();
        res.json({ fabrics });
    } catch (err) {
        console.error("Error fetching fabrics:", err);
        res.status(500).json({ error: "Failed to fetch fabrics" });
    }
};

const addFabric = async (req, res) => {
    console.log("Add Fabric request received");
    console.log("Body:", req.body);
    console.log("File:", req.file);
    const { name, price_per_meter } = req.body;
    if (!name || !price_per_meter) {
        return res.status(400).json({ error: "Name and price are required" });
    }

    try {
        const fabricData = { ...req.body };
        
        // Convert string fields from FormData to appropriate numbers
        if (fabricData.price_per_meter) fabricData.price_per_meter = parseFloat(fabricData.price_per_meter);
        if (fabricData.stock_quantity) fabricData.stock_quantity = parseFloat(fabricData.stock_quantity);
        // Map form field reorder_level → DB column restock_level
        if (fabricData.reorder_level) {
          fabricData.restock_level = parseFloat(fabricData.reorder_level);
          delete fabricData.reorder_level;
        }
        
        // Handle empty fields
        if (fabricData.width === '') fabricData.width = null;
        if (fabricData.restock_date === '') fabricData.restock_date = null;

        if (req.file) {
            // Set image_url to the path of the uploaded file
            fabricData.image_url = `uploads/fabrics/${req.file.filename}`;
        }

        const result = await inventoryService.addFabric(fabricData);
        res.json({ message: "Fabric added successfully", fabric_id: result.fabric_id });
    } catch (err) {
        console.error("Error adding fabric:", err.message, err.stack);
        res.status(500).json({ error: "Failed to add fabric: " + err.message });
    }
};

const updateFabric = async (req, res) => {
    const { id } = req.params;
    console.log("Update Fabric request received for ID:", id);
    console.log("Body:", req.body);
    console.log("File:", req.file);
    try {
        const fabricData = { ...req.body };
        
        // Convert string fields from FormData to appropriate numbers
        if (fabricData.price_per_meter) fabricData.price_per_meter = parseFloat(fabricData.price_per_meter);
        if (fabricData.stock_quantity) fabricData.stock_quantity = parseFloat(fabricData.stock_quantity);
        // Map form field reorder_level → DB column restock_level
        if (fabricData.reorder_level) {
          fabricData.restock_level = parseFloat(fabricData.reorder_level);
          delete fabricData.reorder_level;
        }
        
        // Handle empty fields
        if (fabricData.width === '') fabricData.width = null;
        if (fabricData.restock_date === '') fabricData.restock_date = null;

        if (req.file) {
            // Set image_url to the path of the uploaded file
            fabricData.image_url = `uploads/fabrics/${req.file.filename}`;
        } else if (req.body.existing_image_url) {
            // Preserve existing image if no new one
            fabricData.image_url = req.body.existing_image_url;
        }

        const result = await inventoryService.updateFabric(id, fabricData);
        if (!result) return res.status(404).json({ error: "Fabric not found" });
        res.json({ message: "Fabric updated successfully" });
    } catch (err) {
        console.error("Error updating fabric:", err.message, err.stack);
        res.status(500).json({ error: "Failed to update fabric: " + err.message });
    }
};

const deleteFabric = async (req, res) => {
    const { id } = req.params;
    try {
        const success = await inventoryService.deleteFabric(id);
        if (!success) return res.status(404).json({ error: "Fabric not found" });
        res.json({ message: "Fabric deleted successfully" });
    } catch (err) {
        console.error("Error deleting fabric:", err);
        res.status(500).json({ error: "Failed to delete fabric" });
    }
};

const getStockArrivals = async (req, res) => {
    try {
        const arrivals = await inventoryService.getStockArrivals();
        res.json({ arrivals });
    } catch (err) {
        console.error("Error fetching stock arrivals:", err);
        res.status(500).json({ error: "Failed to fetch stock arrivals" });
    }
};

const recordStockArrival = async (req, res) => {
    const { fabric_id, supplier_id, quantity } = req.body;
    if (!fabric_id || !supplier_id || !quantity) {
        return res.status(400).json({ error: "Fabric, supplier, and quantity are required" });
    }

    try {
        const result = await inventoryService.recordStockArrival({
            ...req.body,
            received_by: req.user.id
        });
        res.json({ message: "Stock arrival recorded successfully", arrival_id: result.arrival_id });
    } catch (err) {
        console.error("Error recording stock arrival:", err);
        res.status(500).json({ error: "Failed to record stock arrival" });
    }
};

const getSuppliers = async (req, res) => {
    try {
        const suppliers = await inventoryService.getSuppliers();
        res.json({ suppliers });
    } catch (err) {
        console.error("Error fetching suppliers:", err);
        res.status(500).json({ error: "Failed to fetch suppliers" });
    }
};

const addSupplier = async (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({ error: "Supplier name is required" });
    }
    try {
        const result = await inventoryService.addSupplier(req.body);
        res.json({ message: "Supplier added successfully", supplier_id: result.supplier_id });
    } catch (err) {
        console.error("Error adding supplier:", err);
        res.status(500).json({ error: "Failed to add supplier" });
    }
};

const updateSupplier = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await inventoryService.updateSupplier(id, req.body);
        if (!result) return res.status(404).json({ error: "Supplier not found" });
        res.json({ message: "Supplier updated successfully" });
    } catch (err) {
        console.error("Error updating supplier:", err);
        res.status(500).json({ error: "Failed to update supplier" });
    }
};

const deleteSupplier = async (req, res) => {
    const { id } = req.params;
    try {
        const success = await inventoryService.deleteSupplier(id);
        if (!success) return res.status(404).json({ error: "Supplier not found" });
        res.json({ message: "Supplier deleted successfully" });
    } catch (err) {
        console.error("Error deleting supplier:", err);
        res.status(500).json({ error: "Failed to delete supplier" });
    }
};

export {
    getDashboard,
    getFabrics,
    getInventoryFabrics,
    addFabric,
    updateFabric,
    deleteFabric,
    getStockArrivals,
    recordStockArrival,
    getSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier
};
