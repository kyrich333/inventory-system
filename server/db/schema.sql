-- ================================
-- Categories
-- ================================
-- Groups item types into categories

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- ================================
-- Item Types
-- ================================
-- Product model codes (A45, B32, etc.)

CREATE TABLE item_types (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, code)
);



-- ================================
-- Brands
-- ================================
-- Manufacturers (Gates, Bando, etc.)

CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- ================================
-- Items
-- ================================
-- Specific product variant
-- (item type + brand)

CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    item_type_id INTEGER REFERENCES item_types(id) ON DELETE CASCADE,
    brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_type_id, brand_id)
);



-- ================================
-- Locations
-- ================================
-- Physical storage slots
-- Example codes:
-- SF-1-A1
-- WH-1-B2

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50),
    item_type_id INTEGER REFERENCES item_types(id),
    capacity INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- ================================
-- Inventory
-- ================================
-- Tracks quantity per item per location

CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, location_id),
    CHECK (quantity >= 0)
);



-- ================================
-- Stock Movements
-- ================================
-- Tracks history of inventory changes

CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id),
    from_location INTEGER REFERENCES locations(id),
    to_location INTEGER REFERENCES locations(id),
    quantity INTEGER NOT NULL,
    movement_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);