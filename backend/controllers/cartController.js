import * as cartService from '../services/cartService.js';

const getCart = async (req, res) => {
    try {
        const cart = await cartService.getCart(req.user.id);
        res.json({ cart });
    } catch (err) {
        console.error("Error fetching cart:", err);
        res.status(500).json({ error: "Failed to fetch cart" });
    }
};

const addToCart = async (req, res) => {
    const { fabric_id, quantity } = req.body;

    if (!fabric_id || !quantity || quantity < 1) {
        return res.status(400).json({ error: "Invalid fabric_id or quantity" });
    }

    try {
        const result = await cartService.addToCart(req.user.id, fabric_id, quantity);
        res.json(result);
    } catch (err) {
        console.error("Error adding to cart:", err);
        if (err.message === "Fabric not found") return res.status(404).json({ error: err.message });
        if (err.message === "Insufficient stock") return res.status(400).json({ error: err.message });
        res.status(500).json({ error: "Failed to add to cart" });
    }
};

const updateCartItem = async (req, res) => {
    const cartId = req.params.id;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ error: "Invalid quantity" });
    }

    try {
        const result = await cartService.updateCartItem(req.user.id, cartId, quantity);
        res.json(result);
    } catch (err) {
        console.error("Error updating cart:", err);
        if (err.message === "Cart item not found") return res.status(404).json({ error: err.message });
        res.status(500).json({ error: "Failed to update cart" });
    }
};

const removeFromCart = async (req, res) => {
    const cartId = req.params.id;
    try {
        const result = await cartService.removeFromCart(req.user.id, cartId);
        res.json(result);
    } catch (err) {
        console.error("Error removing from cart:", err);
        if (err.message === "Cart item not found") return res.status(404).json({ error: err.message });
        res.status(500).json({ error: "Failed to remove from cart" });
    }
};

export {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart
};
