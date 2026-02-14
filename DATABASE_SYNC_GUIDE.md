# Database Schema Synchronization Guide

## Overview
This guide helps you synchronize your database schema with the actual field usage in your frontend and backend code.

## What Was Fixed
The analysis found several inconsistencies between your database schema and application code:

### 🔧 Fabrics Table Issues Fixed:
- ✅ Added `stock_available_quantity` field (used in frontend) 
- ✅ Added `image_url` field (used in frontend)
- ✅ Added `refill_date` field (used in frontend forms)
- ✅ Ensured `restock_date` field exists
- ✅ Maintained `stock_quantity` for backward compatibility

### 🔧 Cart Table Issues Fixed:
- ✅ Fixed foreign key to use `user_id` instead of `customer_id` 
- ✅ Added `total_price` field (used in frontend)
- ✅ Changed quantity to DECIMAL to support meters

### 🔧 Orders Table Issues Fixed:
- ✅ Added `customer_name` field (for display)
- ✅ Added `phone_number` field (used in frontend)
- ✅ Added `delivery_type` field (HOME_DELIVERY, PICKUP)
- ✅ Added `special_instructions` field (customer notes)
- ✅ Added `updated_at` timestamp field

### 🔧 Order Items Table Issues Fixed:
- ✅ Added `fabric_name` field (for historical records)
- ✅ Added `unit_price` and `total_price` fields (used in backend)
- ✅ Standardized column naming conventions

### 🔧 Other Improvements:
- ✅ Created `stock_arrivals` table (for inventory management)
- ✅ Enhanced `payments` table with `bank_slip_url` and `payment_method`
- ✅ Added performance indexes for better query speed
- ✅ Added data validation constraints

## How to Run the Migration

### Option 1: Check Current Schema Status
```bash
cd backend
node migrations/sync-schema.js --check
```

### Option 2: Run the Migration
```bash
cd backend  
node migrations/sync-schema.js --migrate
```

### Option 3: Manual Migration (Using SQL)
If you prefer to run the SQL directly:

1. **Check your current database structure**
2. **Run the migration file:**
   ```bash
   psql -U your_username -d your_database -f migrations/011_sync_schema_with_frontend_backend.sql
   ```

3. **Or use the updated complete schema:**
   ```bash
   psql -U your_username -d your_database -f postgres_schema_updated.sql
   ```

## What Happens During Migration

The migration is designed to be **safe and non-destructive**:

1. **Adds missing columns** without removing existing ones
2. **Migrates data** from old columns to new ones where needed  
3. **Updates constraints** to ensure data integrity
4. **Creates indexes** for better performance
5. **Validates existing data** and fixes inconsistencies

## Verification Steps

After running the migration, verify everything works:

1. **Check that your application starts without errors**
2. **Test fabric management features** (add/edit/delete fabrics)
3. **Test cart functionality** (add items, view cart)  
4. **Test order creation** (place orders)
5. **Test inventory management** (stock arrivals)

## Frontend/Backend Code Changes

The migration makes your database schema match what your code expects, so **no code changes are required**. However, you may want to:

1. **Update any hardcoded column names** in raw SQL queries
2. **Remove any workarounds** for missing fields
3. **Take advantage of new fields** like `image_url` for fabric images

## Rollback (If Needed)

If you need to rollback:

1. **The migration preserves original data** in backup columns
2. **You can restore from a database backup** taken before migration  
3. **Contact support** if you need help with rollback procedures

## Performance Impact

The migration adds several indexes which should **improve** your application performance:

- Faster fabric searches by material/color
- Faster order lookups by customer/status
- Better cart performance for users
- Optimized inventory queries

## Common Issues and Solutions

### Issue: "Column already exists" errors
**Solution:** The migration uses `ADD COLUMN IF NOT EXISTS` - these warnings are harmless

### Issue: Foreign key constraint errors  
**Solution:** The migration handles constraint updates automatically

### Issue: Application still shows old behavior
**Solution:** 
1. Restart your backend server
2. Clear browser cache
3. Check that environment variables point to updated database

## Need Help?

If you encounter any issues:
1. Check the migration logs for specific error messages
2. Verify your database connection settings
3. Ensure you have proper database permissions
4. Check that PostgreSQL version supports all features used

---

**📝 Note:** This migration brings your database schema in line with what your React frontend and Node.js backend actually expect, eliminating field name mismatches and missing columns.