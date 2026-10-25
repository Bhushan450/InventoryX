-- Seed Default Admin User
INSERT INTO users (id, name, email, password, role, flat_number, created_at)
VALUES (1, 'Admin', 'admin@societybulk.com', '$2a$10$BxONYQK4KmbxcnWXFYcPrufwPfQfU2Byq6GyUlD3xGtGAVEPGoueS', 'ADMIN', 'ADMIN', NOW())
ON DUPLICATE KEY UPDATE
    password = IF(email = VALUES(email), VALUES(password), password),
    role = IF(email = VALUES(email), VALUES(role), role);

-- Seed Sample Products
INSERT IGNORE INTO products (id, name, description, category, unit, retail_price, wholesale_price, available, created_at)
VALUES 
(1, 'Rice', 'Everyday staple rice for home cooking.', 'Grains', 'kg', 60.00, 50.00, true, NOW()),
(2, 'Wheat Flour', 'Whole wheat flour for rotis and everyday meals.', 'Grains', 'kg', 40.00, 34.00, true, NOW()),
(3, 'Sugar', 'Granulated sugar for cooking and beverages.', 'Grocery', 'kg', 45.00, 38.00, true, NOW()),
(4, 'Cooking Oil', 'Cooking oil for daily meal preparation.', 'Oil', 'litre', 150.00, 130.00, true, NOW()),
(5, 'Toor Dal', 'Protein-rich split pigeon peas for dal.', 'Pulses', 'kg', 120.00, 100.00, true, NOW()),
(6, 'Salt', 'Fine iodized salt for everyday cooking.', 'Grocery', 'kg', 20.00, 15.00, true, NOW()),
(7, 'Tea', 'Everyday tea leaves for a fresh cup of chai.', 'Beverages', 'kg', 300.00, 250.00, true, NOW()),
(8, 'Detergent', 'Laundry detergent for regular household use.', 'Household', 'kg', 80.00, 65.00, true, NOW());

INSERT INTO products (name, description, category, unit, retail_price, wholesale_price, available, created_at)
SELECT 'Moong Dal', 'Split yellow moong beans for khichdi, soups, and everyday dal.', 'Pulses', 'kg', 145.00, 125.00, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Moong Dal');

INSERT INTO products (name, description, category, unit, retail_price, wholesale_price, available, created_at)
SELECT 'Masoor Dal', 'Red lentils that cook quickly for a nutritious meal.', 'Pulses', 'kg', 110.00, 94.00, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Masoor Dal');

INSERT INTO products (name, description, category, unit, retail_price, wholesale_price, available, created_at)
SELECT 'Chana Dal', 'Split chickpeas for curries, snacks, and home cooking.', 'Pulses', 'kg', 95.00, 82.00, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Chana Dal');

INSERT INTO products (name, description, category, unit, retail_price, wholesale_price, available, created_at)
SELECT 'Urad Dal', 'Whole black gram, a pantry staple for dal and batter.', 'Pulses', 'kg', 150.00, 130.00, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Urad Dal');

INSERT INTO products (name, description, category, unit, retail_price, wholesale_price, available, created_at)
SELECT 'Cola Soft Drink', 'Chilled fizzy cola for family meals and get-togethers.', 'Beverages', '2 litre bottle', 95.00, 82.00, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cola Soft Drink');

INSERT INTO products (name, description, category, unit, retail_price, wholesale_price, available, created_at)
SELECT 'Lemon-Lime Soda', 'Refreshing lemon-lime soft drink for sharing.', 'Beverages', '2 litre bottle', 90.00, 78.00, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Lemon-Lime Soda');

INSERT INTO products (name, description, category, unit, retail_price, wholesale_price, available, created_at)
SELECT 'Dishwashing Liquid', 'Everyday dish soap for cleaning utensils.', 'Household', '500 ml bottle', 110.00, 92.00, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Dishwashing Liquid');

INSERT INTO products (name, description, category, unit, retail_price, wholesale_price, available, created_at)
SELECT 'Bathing Soap', 'Gentle bathing soap for daily use.', 'Personal Care', '4 bar pack', 160.00, 138.00, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bathing Soap');

INSERT INTO products (name, description, category, unit, retail_price, wholesale_price, available, created_at)
SELECT 'Toothpaste', 'Family toothpaste for everyday oral care.', 'Personal Care', '200 g tube', 120.00, 102.00, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Toothpaste');

INSERT INTO products (name, description, category, unit, retail_price, wholesale_price, available, created_at)
SELECT 'Bath Tissue', 'Soft tissue rolls for everyday household use.', 'Household', '6 roll pack', 180.00, 155.00, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bath Tissue');

INSERT INTO products (name, description, category, unit, retail_price, wholesale_price, available, created_at)
SELECT 'Instant Noodles', 'Quick-cooking noodles for an easy snack or meal.', 'Snacks', '6 pack', 90.00, 75.00, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Instant Noodles');

INSERT INTO products (name, description, category, unit, retail_price, wholesale_price, available, created_at)
SELECT 'Bath Shampoo', 'Daily-use shampoo for the whole family.', 'Personal Care', '340 ml bottle', 230.00, 198.00, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bath Shampoo');
