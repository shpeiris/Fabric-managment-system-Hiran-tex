-- Seed suppliers table with sample data
INSERT INTO suppliers (name, contact_person, contact_number, email, address) VALUES
('Lanka Textiles (Pvt) Ltd', 'Nimal Perera', '+94 11 234 5678', 'nimal@lankatextiles.lk', '123 Main St, Colombo 03'),
('Ceylon Fabrics Corporation', 'Anura Silva', '+94 11 765 4321', 'anura@ceylonfabrics.lk', '45 Temple Rd, Kandy'),
('Sampath Textiles', 'Kamal Jayawardena', '+94 81 223 4567', 'kamal@sampathtextiles.lk', '88 Galle Rd, Galle'),
('Royal Silk Industries', 'Chaminda Fernando', '+94 33 234 5678', 'chaminda@royalsilk.lk', '12 Industrial Zone, Kurunegala'),
('Premium Cotton Mills', 'Sunil Bandara', '+94 37 222 3456', 'sunil@premiumcotton.lk', '56 Beach Rd, Kalutara')
ON CONFLICT DO NOTHING;
