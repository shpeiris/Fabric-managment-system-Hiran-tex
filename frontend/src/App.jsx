import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/forgot/ForgotPassword";
import ResetSent from "./pages/forgot/ResetSent";
import NewPassword from "./pages/forgot/NewPassword";
import PasswordResetSuccess from "./pages/forgot/PasswordResetSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardRedirect from "./components/DashboardRedirect";
import AdminLayout from "./pages/admin/layout/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/ManageUsers";
// Unifying: using the functional version from inventory for both roles
import Reports from "./pages/admin/Reports";

// Inventory Imports
import InventoryLayout from "./pages/inventory/layout/InventoryLayout";
import InventoryDashboard from "./pages/inventory/pages/Dashboard"; // Left behind?
import FabricList from "./pages/inventory/FabricList";
import StockAlerts from "./pages/inventory/StockAlerts";
import StockArrivals from "./pages/inventory/pages/StockArrivals"; // Left behind
import InventorySuppliers from "./pages/inventory/pages/SupplierManagement"; // Left behind

// Sales Imports
import SalesLayout from "./pages/sales/layout/SalesLayout";
import SalesDashboard from "./pages/sales/pages/Dashboard"; // Left behind
import SalesCustomers from "./pages/sales/pages/Customers"; // Left behind
import SalesOrders from "./pages/sales/Orders";
import CreateOrder from "./pages/sales/CreateOrder";
import SalesReports from "./pages/sales/pages/Reports"; // Left behind

// Customer Imports
import CustomerLayout from "./pages/customer/layout/CustomerLayout";
import CustomerDashboard from "./pages/customer/pages/Dashboard"; // Left behind
import Shop from "./pages/customer/Shop";
import Cart from "./pages/dashboard/customer/ShoppingCart"; // Updated cart component
import MyOrders from "./pages/customer/MyOrders";
import Payments from "./pages/customer/Payments";
import Profile from "./pages/customer/pages/Profile"; // Left behind
import Checkout from "./pages/dashboard/customer/Checkout"; // Updated checkout component
import OrderDetails from "./pages/customer/pages/OrderDetails"; // Left behind
import OrderHistory from "./pages/customer/pages/OrderHistory"; // Left behind
import Feedback from "./pages/customer/pages/Feedback"; // Left behind
import FabricDetails from "./pages/dashboard/customer/FabricDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset-sent" element={<ResetSent />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
        <Route path="/test-browse" element={<Shop />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Admin Routes - Protected */}
        <Route path="/admin" element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="fabrics" element={<FabricList />} />
          <Route path="suppliers" element={<InventorySuppliers />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Inventory Routes - Protected */}
        <Route path="/inventory" element={
          <ProtectedRoute role="INVENTORY_MANAGER">
            <InventoryLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<InventoryDashboard />} />
          <Route path="fabrics" element={<FabricList />} />
          <Route path="alerts" element={<StockAlerts />} />
          <Route path="stock-arrivals" element={<StockArrivals />} />
          <Route path="suppliers" element={<InventorySuppliers />} />
        </Route>

        {/* Sales Routes - Protected */}
        <Route path="/sales" element={
          <ProtectedRoute role="SALESPERSON">
            <SalesLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<SalesDashboard />} />
          <Route path="customers" element={<SalesCustomers />} />
          <Route path="orders" element={<SalesOrders />} />
          <Route path="new-order" element={<CreateOrder />} />
          <Route path="reports" element={<SalesReports />} />
        </Route>

        {/* Customer Routes - Protected */}
        <Route path="/customer" element={
          <ProtectedRoute role="CUSTOMER">
            <CustomerLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="browse" element={<Shop />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="order-history" element={<OrderHistory />} />
          <Route path="order-details/:id" element={<OrderDetails />} />
          <Route path="payments" element={<Payments />} />
          <Route path="profile" element={<Profile />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="fabric/:id" element={<FabricDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
