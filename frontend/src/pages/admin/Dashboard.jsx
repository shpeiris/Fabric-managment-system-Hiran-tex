import { useEffect, useState } from "react";
import { apiCall } from "../../utils/auth.js";
import "./Dashboard.css";
import { activityService } from "../../services";

export default function Dashboard() {
  const [activities, setActivities] = useState([]);
  const [activityError, setActivityError] = useState("");
  const [activityLoading, setActivityLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalFabrics: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingOrders: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchActivities();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setStatsLoading(true);
      
      // Fetch fabrics data for total count
      const fabricsResponse = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/inventory/fabrics`);
      const fabricsData = await fabricsResponse.json();
      
      // You can add more API calls here for users, orders, etc.
      // For now, we'll update what we can and use mock data for others
      
      if (fabricsResponse.ok) {
        const fabricsCount = fabricsData.fabrics?.length || 0;
        const totalStockValue = fabricsData.fabrics?.reduce((sum, fabric) => {
          return sum + (parseFloat(fabric.price_per_meter) * parseInt(fabric.stock_quantity || 0));
        }, 0) || 0;
        
        setStats(prev => ({
          ...prev,
          totalFabrics: fabricsCount,
          totalRevenue: totalStockValue,
          // Mock data for other stats that don't have endpoints yet
          totalUsers: 120,
          totalOrders: 45,
          activeUsers: 85,
          pendingOrders: 12
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use fallback mock data
      setStats({
        totalUsers: 120,
        totalOrders: 45,
        totalFabrics: 25,
        totalRevenue: 150000,
        activeUsers: 85,
        pendingOrders: 12
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const result = await activityService.getRecent(6);
      setActivities(result);
    } catch (error) {
      setActivityError(error.error || "Could not load recent activities");
    } finally {
      setActivityLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1 style={{ marginBottom: "30px" }}>Admin Dashboard Overview</h1>
      
      {statsLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading dashboard data...</div>
      ) : (
        <>
          <StatCard title="Active Users" value={stats.activeUsers.toString()} />

          {/* Stats Grid */}
          <h2 style={{ fontSize: "18px", marginBottom: "20px", opacity: 0.8 }}>Key Metrics</h2>
          <div className="stats-grid">
            <StatCard title="Total Users" value={stats.totalUsers.toString()} />
            <StatCard title="Total Fabrics" value={stats.totalFabrics.toString()} />
            <StatCard title="Pending Orders" value={stats.pendingOrders.toString()} />
          </div>
        </>
      )}


      {/* Recent System Activities */}
      <h2 style={{ fontSize: "18px", marginBottom: "20px", opacity: 0.8 }}>Recent System Activities</h2>
      <div className="activity-section">
        <table className="activity-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>User</th>
              <th>Details</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {activityLoading && (
              <tr>
                <td colSpan="4">Loading recent activity...</td>
              </tr>
            )}

            {!activityLoading && activityError && (
              <tr>
                <td colSpan="4" className="error-text">{activityError}</td>
              </tr>
            )}

            {!activityLoading && !activityError && activities.length === 0 && (
              <tr>
                <td colSpan="4">No activity recorded yet.</td>
              </tr>
            )}

            {!activityLoading &&
              !activityError &&
              activities.map((activity) => (
                <tr key={activity.log_id}>
                  <td>{activity.action || "Activity"}</td>
                  <td className="user-highlight">
                    {activity.actor_name || "Unknown"}
                    <div className="actor-role">{activity.actor_role || ""}</div>
                  </td>
                  <td>{formatDetails(activity.details)}</td>
                  <td>
                    <span className="time-badge">{formatTimeAgo(activity.created_at)}</span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="stat-card" style={{ borderLeft: "4px solid #28a745" }}>
      <div>
        <h4 className="stat-title">{title}</h4>
        <h2 className="stat-value">{value}</h2>
      </div>
    </div>
  );
}

const formatDetails = (text) => {
  if (!text) return "—";
  if (text.length <= 80) return text;
  return `${text.slice(0, 77)}...`;
};

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Just now";
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;

  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
};
