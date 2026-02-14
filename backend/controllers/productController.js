import * as productService from '../services/productService.js';

const getFabrics = async (req, res) => {
    try {
        const fabrics = await productService.getPublicFabrics(req.query);
        res.json({ fabrics });
    } catch (err) {
        console.error("Error fetching fabrics:", err);
        res.status(500).json({ error: "Failed to fetch fabrics" });
    }
};

const getFabricById = async (req, res) => {
    const { id } = req.params;
    try {
        const fabric = await productService.getPublicFabricById(id);
        if (!fabric) {
            return res.status(404).json({ error: "Fabric not found" });
        }
        res.json({ fabric });
    } catch (err) {
        console.error("Error fetching fabric:", err);
        res.status(500).json({ error: "Failed to fetch fabric" });
    }
};

export {
    getFabrics,
    getFabricById
};
