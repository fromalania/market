-- docs/migrations.sql
-- Миграция №1: создаём таблицу reviews

CREATE TABLE IF NOT EXISTS reviews (
    id          SERIAL PRIMARY KEY,
    product_id  INTEGER NOT NULL,
    user_id     INTEGER,
    rating      INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Миграция №2: добавляем поле avg_rating в таблицу products
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(2,1) DEFAULT 0.0;

-- Идея пересчёта средней оценки:
-- UPDATE products p
-- SET avg_rating = sub.avg
-- FROM (
--   SELECT product_id, ROUND(AVG(rating)::numeric, 1) AS avg
--   FROM reviews
--   GROUP BY product_id
-- ) sub
-- WHERE sub.product_id = p.id;
