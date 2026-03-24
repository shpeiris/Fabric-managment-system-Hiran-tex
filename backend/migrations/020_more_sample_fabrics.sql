-- Migration 020: Add more diverse sample fabrics
INSERT INTO fabrics (name, material_type, color, design, price_per_meter, stock_quantity, restock_level) VALUES
-- Cottons
('Cotton Stripe Red',         'Cotton',     'Red',          'Striped',           230.00,  180,  50),
('Cotton Check Green',        'Cotton',     'Green',        'Checked',           210.00,  140,  40),
('Cotton Batik Yellow',       'Cotton',     'Yellow',       'Batik Print',       270.00,   95,  30),
('Cotton Poplin Sky Blue',    'Cotton',     'Sky Blue',     'Plain',             195.00,  260,  60),
('Cotton Flannel Maroon',     'Cotton',     'Maroon',       'Brushed',           290.00,   75,  25),

-- Silks & Satins
('Pure Silk Red',             'Silk',       'Red',          'Solid',            1500.00,   40,  15),
('Silk Raw Natural',          'Silk',       'Natural',      'Raw Texture',      1350.00,   55,  20),
('Satin Bridal Ivory',        'Satin',      'Ivory',        'Solid',             750.00,   65,  20),
('Satin Floral Peach',        'Satin',      'Peach',        'Floral Emboss',     820.00,   50,  15),

-- Linens
('Linen Stripe Navy',         'Linen',      'Navy',         'Striped',           420.00,  110,  35),
('Linen Mix Olive',           'Linen',      'Olive',        'Plain Weave',       390.00,   90,  30),
('Linen Embroidered Ecru',    'Linen',      'Ecru',         'Embroidered',       580.00,   45,  15),

-- Polyesters
('Polyester Crepe Black',     'Polyester',  'Black',        'Crepe Texture',     165.00,  320,  80),
('Polyester Taffeta Orange',  'Polyester',  'Orange',       'Plain',             155.00,  280,  70),
('Polyester Mesh White',      'Polyester',  'White',        'Open Mesh',         140.00,  200,  60),
('Polyester Jacquard Teal',   'Polyester',  'Teal',         'Jacquard',          310.00,   85,  25),

-- Specialty fabrics
('Velvet Smooth Royal Blue',  'Velvet',     'Royal Blue',   'Solid',             920.00,   30,  12),
('Chiffon Ombre Pink',        'Chiffon',    'Pink',         'Ombre Gradient',    410.00,   70,  20),
('Organza Embroidered Gold',  'Organza',    'Gold',         'Embroidered',       680.00,   35,  12),
('Brocade Traditional Green', 'Brocade',    'Green',        'Traditional',      1100.00,   25,  10),
('Denim Stretch Indigo',      'Denim',      'Indigo',       'Stretch Weave',     310.00,  190,  50),
('Lace Guipure Cream',        'Lace',       'Cream',        'Guipure Lace',      560.00,   60,  20),
('Tulle Soft White',          'Tulle',      'White',        'Fine Net',          175.00,  150,  40),
('Twill Herringbone Brown',   'Twill',      'Brown',        'Herringbone',       485.00,   80,  25),
('Georgette Printed Purple',  'Georgette',  'Purple',       'Abstract Print',    340.00,  100,  30)
ON CONFLICT DO NOTHING;
