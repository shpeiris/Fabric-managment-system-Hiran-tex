import { Outlet } from "react-router-dom";
import SalesSidebar from "../components/SalesSidebar";
import LogViewer from "../components/LogViewer";
import "./SalesLayout.css";

const SalesLayout = () => {
  return (
    <div className="sales-layout">
      <SalesSidebar />
      <div className="sales-main-content">
        <Outlet />
      </div>
      <LogViewer />
    </div>
  );
};

export default SalesLayout;