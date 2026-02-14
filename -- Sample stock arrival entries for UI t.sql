-- Sample stock arrival entries for UI testing
-- NOTE: arrival_id is auto-generated (SERIAL), created_at has DEFAULT CURRENT_TIMESTAMP

INSERT INTO stock_arrivals (
    fabric_id,
    supplier_id,
    arrival_date,
    quantity,
    supply_unit_price,
    total_value
  )
VALUES 
  -- Cotton fabric arrival
  (1, 1, '2026-01-25', 500, 320.00, 160000.00),
  
  -- Silk fabric arrival  
  (2, 2, '2026-01-24', 200, 1100.00, 220000.00),
  
  -- Linen fabric arrival (restocking low stock item)
  (3, 1, '2026-01-26', 300, 750.00, 225000.00),
  
  -- Denim fabric arrival
  (4, 2, '2026-01-23', 150, 580.00, 87000.00),
  
  -- Wool fabric arrival
  (5, 1, '2026-01-22', 100, 1650.00, 165000.00);

-- Alternative single insert format for UI forms:
-- INSERT INTO stock_arrivals (fabric_id, supplier_id, arrival_date, quantity, supply_unit_price, total_value)
-- VALUES (1, 1, CURRENT_DATE, 250, 300.00, 75000.00);

-- After running migration 011, use this to test the updated UI:
-- 1. Stock arrivals will show in both inventory and dashboard pages
-- 2. Forms will calculate total_value automatically  
-- 3. Stock levels will update automatically when arrivals are recorded