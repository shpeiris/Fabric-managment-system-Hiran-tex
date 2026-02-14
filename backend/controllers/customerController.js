import * as customerService from '../services/customerService.js';

export const getDashboardStats = async (req, res) => {
    try {
        const stats = await customerService.getCustomerDashboardStats(req.user.id);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching customer stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};
