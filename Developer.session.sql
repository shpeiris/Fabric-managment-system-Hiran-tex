INSERT INTO fabrics (
    fabric_id,
    name,
    material_type,
    color,
    design,
    price_per_meter,
    stock_quantity,
    created_at,
    restock_level,
    restock_date
  )
VALUES (
    fabric_id:integer,
    'name:character varying',
    'material_type:character varying',
    'color:character varying',
    'design:character varying',
    price_per_meter:numeric,
    stock_quantity:integer,
    'created_at:timestamp without time zone',
    restock_level:integer,
    'restock_date:date'
  );