import * as customerService from '../services/customerService.js';
import { pool } from '../config/db.js';

export const getDashboardStats = async (req, res) => {
    try {
        const stats = await customerService.getCustomerDashboardStats(req.user.id);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching customer stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};

export const submitFeedback = async (req, res) => {
    const { order_id, overall_rating, order_experience, fabric_quality, delivery, customer_service, comments } = req.body;
    const customerId = req.user.id;

    if (!overall_rating || overall_rating < 1 || overall_rating > 5) {
        return res.status(400).json({ error: 'Overall rating is required (1-5)' });
    }

    try {
        await customerService.submitOrderFeedback({
            customerId,
            orderId: order_id,
            overall_rating,
            order_experience,
            fabric_quality,
            delivery,
            customer_service,
            comments
        });

        res.json({ message: 'Thank you for your feedback!' });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'You have already submitted feedback for this order' });
        }
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
};

export const getOrderFeedback = async (req, res) => {
    const { orderId } = req.params;
    const customerId = req.user.id;

    try {
        const feedback = await customerService.getOrderFeedback(customerId, orderId);
        res.json({ feedback });
    } catch (error) {
        console.error('Error fetching order feedback:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
};

export const getNotifications = async (req, res) => {
    try {
        const notifications = await customerService.getCustomerNotifications(req.user.id);
        res.json({ notifications });
    } catch (error) {
        console.error('Error fetching customer notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};
