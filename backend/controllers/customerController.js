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
    const { overall_rating, order_experience, fabric_quality, delivery, customer_service, comments } = req.body;
    const customerId = req.user.id;

    if (!overall_rating || overall_rating < 1 || overall_rating > 5) {
        return res.status(400).json({ error: 'Overall rating is required (1-5)' });
    }

    try {
        // Try to insert into feedback table if it exists, otherwise log gracefully
        try {
            await pool.query(
                `INSERT INTO feedback (customer_id, overall_rating, order_experience, fabric_quality, delivery, customer_service, comments)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [customerId, overall_rating, order_experience || null, fabric_quality || null,
                 delivery || null, customer_service || null, comments || null]
            );
        } catch (dbErr) {
            // Table may not exist; log feedback to console for now
            console.log(`[FEEDBACK] Customer ${customerId}: overall=${overall_rating}, comment="${comments}"`);
        }

        res.json({ message: 'Thank you for your feedback!' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
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
