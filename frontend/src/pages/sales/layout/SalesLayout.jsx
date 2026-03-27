import { Outlet } from "react-router-dom";
import SalesSidebar from "../components/SalesSidebar";
import "./SalesLayout.css";

const SalesLayout = () => {
  return (
    <div className="sales-layout">
      <SalesSidebar />
      <div className="sales-main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default SalesLayout;
