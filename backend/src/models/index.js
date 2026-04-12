import { initEmployeeModel } from "./EmployeeModel.js";
import { initAuthModel } from "./AuthModel.js";
import { initCustomerModel } from "./CustomerModel.js";
import { initSupplierModel } from "./SupplierModel.js";
import { initActivityLogModel } from "./ActivityLogModel.js";
import { initFabricModel } from "./FabricModel.js";
import { initStockArrivalModel } from "./StockArrivalModel.js";
import { initOrderModel } from "./OrderModel.js";
import { initCartModel } from "./CartModel.js";
import { initOrderItemModel } from "./OrderItemModel.js";
import { initPaymentModel } from "./PaymentModel.js";
import { initInvoiceModel } from "./InvoiceModel.js";
import { initConfirmationLogModel } from "./ConfirmationLogModel.js";
import { initFeedbackModel } from "./FeedbackModel.js";

import { initHomePageModel } from "./HomePageModel.js";
import { pool } from "../config/db.js";

export const initModels = async () => {
  try {
    console.log("Initializing Database Singleton Models...");

    // Sequence 1: Base Tables & Types
    await initEmployeeModel();
    await initAuthModel();
    await initCustomerModel();
    await initSupplierModel();
    await initActivityLogModel();
    await initFabricModel();
    await initHomePageModel();

    // Sequence 2: Tables with Foreign Key Dependencies
    await initStockArrivalModel();
    await initOrderModel();
    await initCartModel();

    // Sequence 3: Transactional Tables (Dependent on Orders/Fabrics)
    await initOrderItemModel();
    await initPaymentModel();
    await initInvoiceModel();
    await initConfirmationLogModel();
    await initFeedbackModel();

    console.log(" Database Models synchronized successfully.");
  } catch (error) {
    console.error("Failed to synchronize database models:", error);
    throw error;
  }
};
