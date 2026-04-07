import { useEffect, useState } from "react";
import { apiCall } from "../../utils/auth.js";
import "./Dashboard.css";
import { activityService } from "../../services";
import { 
  RefreshCw
} from "lucide-react";

/* Icons removed per user request */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const REFRESH_INTERVAL_MS = 30_000; 

export default function Dashboard() {
  const [stats, setStats]               = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError]     = useState("");
  const [lastUpdated, setLastUpdated]   = useState(null);

  const [activities, setActivities]           = useState([]);
  const [activityError, setActivityError]     = useState("");
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchActivities();

    const interval = setInterval(() => {
      fetchStats(true); 
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async (silent = false) => {
    try {
      if (!silent) setStatsLoading(true);
      const res = await apiCall(`${BASE}/admin/dashboard-stats`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch {
      if (!silent) setStatsError("Could not load dashboard stats.");
    } finally {
      if (!silent) setStatsLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const result = await activityService.getRecent(8);
      setActivities(result);
    } catch (error) {
      setActivityError(error.error || "Could not load recent activities");
    } finally {
      setActivityLoading(false);
    }
  };

  const fmt = (n) =>
    typeof n === "number"
      ? n.toLocaleString("en-LK")
      : "0";

  const fmtCurrency = (n) =>
    typeof n === "number"
      ? `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      : "Rs. 0";

  return (
    <div className="dashboard-container">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Admin Overview</h1>
          <p className="dash-subtitle">
            {new Date().toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="dash-refresh">
          {lastUpdated && (
            <span className="last-updated">
              Last sync: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            className="refresh-btn"
            onClick={() => { fetchStats(); fetchActivities(); }}
            title="Refresh now"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} className={statsLoading ? "spin" : ""} />
            {statsLoading ? "Updating..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {statsLoading && !stats ? (
        <div className="dash-loading">
            <RefreshCw size={40} className="spin" style={{ marginBottom: '15px', color: '#001a66' }} />
            <p>Gathering intelligence...</p>
        </div>
      ) : statsError ? (
        <div className="dash-error">{statsError}</div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              title="Operational Staff"
              value={fmt(stats?.employees?.active)}
              sub={`${fmt(stats?.employees?.total)} total employees`}
              color="#28a745"
            />
            <StatCard
              title="Client Base"
              value={fmt(stats?.customers?.total)}
              sub="number of customers"
              color="#28a745"
            />
            <StatCard
              title="Sales Volume"
              value={fmt(stats?.orders?.total)}
              sub={`${fmt(stats?.orders?.pending)} pending action`}
              color="#28a745"
            />
            <StatCard
              title="Total Revenue"
              value={fmtCurrency(stats?.revenue?.total)}
              sub="Completed transactions"
              color="#28a745"
            />
            <StatCard
              title="Inventory Risk"
              value={fmt(stats?.lowStockFabrics?.length)}
              sub="Items below threshold"
              color="#28a745"
              alert={stats?.lowStockFabrics?.length > 0}
            />
          </div>

          {/* ── Order Status Breakdown ── */}
          <div className="dash-section-header">
            <h2 className="section-title">Fulfillment Pipeline</h2>
          </div>
          <div className="order-status-grid">
            <StatusPill label="Pending"    count={stats?.orders?.pending}    color="#28a745" />
            <StatusPill label="Processing" count={stats?.orders?.processing} color="#28a745" />
            <StatusPill label="Delivered"  count={stats?.orders?.delivered}  color="#28a745" />
            <StatusPill label="Cancelled"  count={stats?.orders?.cancelled}  color="#28a745" />
          </div>

          {/* ── Low Stock Alerts ── */}
          {stats?.lowStockFabrics?.length > 0 && (
            <>
              <div className="dash-section-header">
                <h2 className="section-title critical">
                  Critical Inventory Alerts
                </h2>
              </div>
              <div className="activity-section" style={{ marginBottom: "40px" }}>
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Fabric Resource</th>
                      <th>Material</th>
                      <th>Colorway</th>
                      <th>Current Level</th>
                      <th>Critical Mark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lowStockFabrics.map((f) => (
                      <tr key={f.fabric_id}>
                        <td style={{ fontWeight: 600 }}>{f.name}</td>
                        <td>{f.material_type || "—"}</td>
                        <td>{f.color || "—"}</td>
                        <td>
                          <span className="stock-badge stock-low">
                            {f.stock_quantity} m
                          </span>
                        </td>
                        <td style={{ color: "#6c757d" }}>{f.restock_level} m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* ── Recent System Activities ── */}
      <div className="dash-section-header">
        <h2 className="section-title">Audit Trail / System Logs</h2>
      </div>
      <div className="activity-section">
        <table className="activity-table">
          <thead>
            <tr>
              <th>Operation</th>
              <th>Responsible Actor</th>
              <th>Category</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {activityLoading && (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
                <RefreshCw size={24} className="spin" style={{ marginBottom: '10px' }} /><br/>
                Syncing audit logs...
              </td></tr>
            )}
            {!activityLoading && activityError && (
              <tr><td colSpan="4" className="error-text" style={{ padding: "20px 25px" }}>{activityError}</td></tr>
            )}
            {!activityLoading && !activityError && activities.length === 0 && (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>Void. No system events recorded yet.</td></tr>
            )}
            {!activityLoading && !activityError && activities.map((a) => (
              <tr key={a.log_id}>
                <td>{a.action || "Activity"}</td>
                <td className="user-highlight">
                  {a.actor_name || "System"}
                  <div className="actor-role">{a.actor_role || "Internal"}</div>
                </td>
                <td>
                  <span className="type-badge">{a.action_type || "LOG"}</span>
                </td>
                <td>
                  <span className="time-badge">{formatTimeAgo(a.created_at)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ title, value, sub, color, alert }) {
  return (
    <div className="stat-card shadow-premium" style={{ border: `2px solid ${color}` }}>
      <div className="stat-info">
        <h4 className="stat-title">{title}</h4>
        <h2 className="stat-value" style={{ color }}>{value}</h2>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
      {alert && <div className="alert-dot" />}
    </div>
  );
}

function StatusPill({ label, count, color }) {
  return (
    <div className="status-pill shadow-premium" style={{ border: `2px solid ${color}` }}>
      <span className="status-pill-count" style={{ color }}>{count ?? 0}</span>
      <span className="status-pill-label">{label}</span>
    </div>
  );
}

/* ── Helpers ── */
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Present";
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const mins  = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};
