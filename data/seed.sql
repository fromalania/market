-- Очистка (на всякий)
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- === Пользователи
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

-- === Товары
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,           -- в рублях
  avg_rating REAL DEFAULT NULL      -- будем пересчитывать из reviews
);

-- === Отзывы
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(product_id) REFERENCES products(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Данные
INSERT INTO users (id, name, email) VALUES
 (1,'Анна','anna@example.com'),
 (2,'Борис','boris@example.com'),
 (3,'Диана','diana@example.com');

INSERT INTO products (id, slug, title, price) VALUES
 (101,'adventure-quest','Adventure Quest',1990),
 (102,'space-traders','Space Traders',2490),
 (103,'mystic-forest','Mystic Forest',2290);

INSERT INTO reviews (product_id, user_id, rating, text) VALUES
 (101,1,5,'Очень понравилась кооперативная механика'),
 (101,2,4,'Круто, но хотелось бы больше карт'),
 (102,2,5,'Лучшее про космос'),
 (102,3,4,'Немного затянут сетап'),
 (103,1,3,'Красиво, но правила сложноваты');

-- Пересчёт среднего рейтинга в products.avg_rating
UPDATE products p
SET avg_rating = (
  SELECT ROUND(AVG(r.rating), 2) FROM reviews r WHERE r.product_id = p.id
);

-- Контрольные выборки (их мы используем для скринов):
-- 1) Все товары с рассчитанным средним рейтингом
SELECT id, title, price, avg_rating FROM products ORDER BY id;

-- 2) Джойн users/products/reviews (Каждая строка — конкретный отзыв)
SELECT
  r.id AS review_id,
  p.title AS product,
  u.name  AS user,
  r.rating,
  r.text,
  r.created_at
FROM reviews r
JOIN users u ON u.id = r.user_id
JOIN products p ON p.id = r.product_id
ORDER BY r.id;
