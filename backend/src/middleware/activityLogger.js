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
      INSERT INTO activity_logs (customer_id, employee_id, action_type, actor_type, action)
      VALUES ($1, $2, $3, $4, $5)
    `;

    // Map common actor_type to action_type if not provided
    const actionType = 
      action.includes("LOGIN") ? "LOGIN" :
      action.includes("LOGOUT") ? "LOGOUT" :
      action.includes("ORDER") ? "ORDER_ACTION" :
      action.includes("PAYMENT") ? "PAYMENT_ACTION" :
      "SYSTEM_EVENT";

    await pool.query(sql, [
      actorType === "CUSTOMER" ? actorId : null,
      actorType === "EMPLOYEE" ? actorId : null,
      actionType,
      actorType,
      action
    ]);
  } catch (err) {
    console.error("Error logging activity:", err);
  }
};

export default logActivity;
