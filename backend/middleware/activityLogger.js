import { pool } from "../config/db.js";

// Activity Logger
const logActivity = async (actor, action, details, req) => {
  try {
    const ip =
      req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req?.socket?.remoteAddress ||
      null;
    const userAgent = req?.headers?.["user-agent"] || null;

    const detailsStr =
      typeof details === "object" ? JSON.stringify(details) : details || null;

    let actorId = null;
    let actorType = "SYSTEM";

    if (actor && typeof actor === "object") {
      actorId =
        actor.id ||
        actor.employee_id ||
        actor.customer_id ||
        null;

      const role = (actor.role || actor.type || "").toUpperCase();
      if (role === "CUSTOMER") {
        actorType = "CUSTOMER";
      } else if (role) {
        actorType = "EMPLOYEE";
      }
    } else if (actor) {
      actorId = actor;
      actorType = "USER";
    } else if (req?.user?.role) {
      // Fallback to session user when actor not provided
      actorId = req.user.id || null;
      actorType = req.user.role === "CUSTOMER" ? "CUSTOMER" : "EMPLOYEE";
    }

    const sql = `
      INSERT INTO activity_logs (actor_id, actor_type, action, details, ip_address, user_agent, customer_id, employee_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    await pool.query(sql, [
      actorId,
      actorType,
      action,
      detailsStr,
      ip,
      userAgent,
      actorType === "CUSTOMER" ? actorId : null,
      actorType === "EMPLOYEE" ? actorId : null,
    ]);
  } catch (err) {
    console.error("Error logging activity:", err);
  }
};

export default logActivity;
