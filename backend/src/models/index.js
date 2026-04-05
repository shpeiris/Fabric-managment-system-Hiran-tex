import { initEmployeeModel } from "./EmployeeModel.js";
import { initAuthModel } from "./AuthModel.js";
import { initCustomerModel } from "./CustomerModel.js";
import { initSupplierModel } from "./SupplierModel.js";
import { initDeliveryTypeModel } from "./DeliveryTypeModel.js";
import { initPaymentMethodModel } from "./PaymentMethodModel.js";
import { initOrderStatusModel } from "./OrderStatusModel.js";
import { initActivityLogModel } from "./ActivityLogModel.js";
import { initFabricModel } from "./FabricModel.js";
import { initStockArrivalModel } from "./StockArrivalModel.js";
import { initOrderModel } from "./OrderModel.js";
import { initCartModel } from "./CartModel.js";
import { initOrderItemModel } from "./OrderItemModel.js";
import { initPaymentModel } from "./PaymentModel.js";
import { initOrderDeliveryInfoModel } from "./OrderDeliveryInfoModel.js";
import { initInvoiceModel } from "./InvoiceModel.js";
import { initConfirmationLogModel } from "./ConfirmationLogModel.js";
import { initFeedbackModel } from "./FeedbackModel.js";
import { initCatalogModel } from "./CatalogModel.js";
import { initCatalogItemModel } from "./CatalogItemModel.js";
import { pool } from "../config/db.js";

export const initModels = async () => {
  try {
    console.log("Initializing Database Singleton Models...");

    // Sequence 1: Base Tables & Types
    await initEmployeeModel();
    await initAuthModel();
    await initCustomerModel();
    await initSupplierModel();
    await initDeliveryTypeModel();
    await initPaymentMethodModel();
    await initOrderStatusModel();
    await initActivityLogModel();
    await initFabricModel();

    // Sequence 2: Tables with Foreign Key Dependencies
    await initStockArrivalModel();
    await initOrderModel();
    await initCartModel();

    // Sequence 3: Transactional Tables (Dependent on Orders/Fabrics)
    await initOrderItemModel();
    await initPaymentModel();
    await initOrderDeliveryInfoModel();
    await initInvoiceModel();
    await initConfirmationLogModel();
    await initFeedbackModel();
    await initCatalogModel();
    await initCatalogItemModel();

    // Seed Catalog ID 1 if it doesn't exist
    const catalogCheck = await pool.query("SELECT * FROM catalogs WHERE catalog_id = 1");
    if (catalogCheck.rows.length === 0) {
      await pool.query(
        "INSERT INTO catalogs (catalog_id, name, description) VALUES (1, 'Main Collection', 'Primary fabric collection for customers')"
      );
      console.log(" Seeded Catalog ID 1 (Main Collection).");
    }

    console.log(" Database Models synchronized successfully.");
  } catch (error) {
    console.error("Failed to synchronize database models:", error);
    throw error;
  }
};
