// contains inventory function to get inventory data from database and send it as response to client


const pool = require("../db/db");

exports.getInventory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        items.id,
        item_types.code,
        brands.name AS brand,
        locations.code AS location,
        inventory.quantity
      FROM inventory
      JOIN items ON inventory.item_id = items.id
      JOIN item_types ON items.item_type_id = item_types.id
      JOIN brands ON items.brand_id = brands.id
      JOIN locations ON inventory.location_id = locations.id
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.getItems = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        items.id,
        item_types.code,
        brands.name AS brand
      FROM items
      JOIN item_types ON items.item_type_id = item_types.id
      JOIN brands ON items.brand_id = brands.id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.searchInventory = async (req, res) => {
  try {
    const { code } = req.query;

    const result = await pool.query(`
      SELECT
        item_types.code,
        brands.name AS brand,
        locations.code AS location,
        inventory.quantity
      FROM inventory
      JOIN items ON inventory.item_id = items.id
      JOIN item_types ON items.item_type_id = item_types.id
      JOIN brands ON items.brand_id = brands.id
      JOIN locations ON inventory.location_id = locations.id
      WHERE item_types.code = $1
    `, [code]);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};