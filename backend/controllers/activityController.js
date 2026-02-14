import { pool } from "../config/db.js";

const getRecentActivities = async (req, res) => {
  const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);

  try {
    const sql = `
      SELECT 
        al.log_id,
        al.action,
        al.details,
        al.actor_id,
        al.actor_type,
        al.ip_address,
        al.user_agent,
        al.created_at,
        COALESCE(e.full_name, c.full_name, 'System') AS actor_name,
        COALESCE(e.email, c.email, 'system') AS actor_email,
        CASE 
          WHEN al.actor_type = 'EMPLOYEE' THEN COALESCE(e.role::text, 'EMPLOYEE')
          WHEN al.actor_type = 'CUSTOMER' THEN 'CUSTOMER'
          ELSE COALESCE(al.actor_type, 'SYSTEM')
        END AS actor_role
      FROM activity_logs al
      LEFT JOIN employees e ON al.actor_type = 'EMPLOYEE' AND al.actor_id = e.employee_id
      LEFT JOIN customers c ON al.actor_type = 'CUSTOMER' AND al.actor_id = c.customer_id
      ORDER BY al.created_at DESC
      LIMIT $1
    `;

    const { rows } = await pool.query(sql, [limit]);
    res.json({ activities: rows });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
};

export { getRecentActivities };
