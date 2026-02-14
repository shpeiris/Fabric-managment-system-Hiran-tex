# Users Table Removal Guide

## Overview
This migration removes the redundant `users` table from your PostgreSQL database and updates all references to use the `employees` and `customers` tables directly.

## What Was Changed

### 🗑️ **Removed Tables:**
- `users` table (completely removed)
- `user_sessions` table (removed - used JWT tokens instead)

### 🔄 **Updated References:**

#### **1. Activity Logs Table**
- **Before:** `user_id` referencing `users.id`
- **After:** `employee_id` referencing `employees.employee_id`

#### **2. Customers Table** 
- **Before:** Had `user_id` column linking to `users` table
- **After:** Independent table with direct authentication fields

#### **3. Cart Table**
- **Before:** `user_id` referencing `users.id`
- **After:** `user_id` referencing `customers.customer_id` (field name kept for frontend compatibility)

#### **4. Orders Table**
- **Before:** `user_id` referencing `users.id` 
- **After:** `customer_id` referencing `customers.customer_id`

#### **5. Payments Table**
- **Before:** `verified_by` referencing `users.id`
- **After:** `verified_by` referencing `employees.employee_id`

### 💻 **Updated Backend Code:**

#### **Sales Service** (`services/salesService.js`)
- Updated queries to use `customers` table instead of `users`
- Fixed PostgreSQL date functions (EXTRACT instead of MONTH/YEAR)
- Updated JOIN conditions to use correct foreign keys

## How to Apply

### **Option 1: Using Migration Script**
```bash
cd backend
node migrations/remove-users.js --remove
```

### **Option 2: Direct SQL**
```bash
psql -U username -d database -f migrations/012_remove_users_table.sql
```

### **Verify Changes**
```bash
node migrations/remove-users.js --verify
```

## Database Structure After Cleanup

```
📊 Your database now has:
├── employees (staff: admin, inventory, sales)
├── customers (clients)
├── fabrics 
├── suppliers
├── orders (customer_id → customers)
├── cart (user_id → customers) 
├── payments (verified_by → employees)
├── order_items
├── stock_arrivals
└── activity_logs (employee_id → employees)
```

## Benefits

### ✅ **Simplified Structure:**
- No redundant user management
- Clear separation: employees vs customers
- Cleaner foreign key relationships

### ✅ **Better Performance:**
- Fewer JOIN operations
- Direct table relationships
- Optimized queries

### ✅ **Clearer Logic:**
- Employees handle operations
- Customers place orders
- No ambiguous user roles

## Authentication Impact

### **Before:**
```javascript
// Mixed user roles in one table
users: { role: 'ADMIN' | 'CUSTOMER' | 'INVENTORY' | 'SALES' }
```

### **After:**
```javascript
// Separate authentication for each type
employees: { role: 'ADMIN' | 'INVENTORY' | 'SALES' }
customers: { /* customer-specific fields */ }
```

## Frontend Compatibility

Your React frontend should continue working without changes because:
- Cart still uses `user_id` field name
- Orders now properly reference `customer_id`
- Authentication endpoints can be updated to use appropriate tables

## Rollback (If Needed)

If you need to rollback:
1. Restore from database backup
2. Or recreate users table and migrate data back
3. Update foreign keys to reference users table again

---

**✅ Migration completed! Your database now uses employees and customers tables directly without the redundant users table.**