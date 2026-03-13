import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";

// Middleware configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow frontend URL from environment variable
      const allowedOrigins = [
        process.env.FRONTEND_URL || "http://localhost:5173",
        /^http:\/\/localhost:\d+$/,
      ];

      // Check if origin matches allowed origins
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return allowed === origin;
      });

      if (isAllowed) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  }),
);

app.use(express.json());

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session middleware (In-Memory for now, replacing DB storage)
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "fabric_secret_key_change_in_production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === "production", // Secure in production
      httpOnly: true,
    },
  }),
);

// Routes
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", inventoryRoutes);
app.use("/", salesRoutes);
app.use("/", cartRoutes);
app.use("/", orderRoutes);
app.use("/", paymentRoutes);
app.use("/", reportRoutes);
app.use("/", productRoutes);
app.use("/", activityRoutes);
app.use("/", customerRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });
});

export default app;
