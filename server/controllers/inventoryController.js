// contains inventory function to get inventory data from database and send it as response to client

const pool = require("../db/db");


// =================================
// Get Full Inventory
// =================================
exports.getInventory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        items.id,
        item_types.code,
        item_types.description,
        brands.name AS brand,
        locations.code AS location,
        inventory.quantity
      FROM inventory
      JOIN items ON inventory.item_id = items.id
      JOIN item_types ON items.item_type_id = item_types.id
      JOIN brands ON items.brand_id = brands.id
      JOIN locations ON inventory.location_id = locations.id
      ORDER BY item_types.code, brands.name
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};


// =================================
// Get Items (for dropdowns etc.)
// =================================
exports.getItems = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        items.id,
        item_types.code,
        item_types.description,
        brands.name AS brand
      FROM items
      JOIN item_types ON items.item_type_id = item_types.id
      JOIN brands ON items.brand_id = brands.id
      ORDER BY item_types.code, brands.name
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};


// =================================
// Search Inventory
// =================================
exports.searchInventory = async (req, res) => {
  try {
    const { q } = req.query;

    // if search is empty return full inventory
    if (!q || q.trim() === "") {
      const result = await pool.query(`
        SELECT
          items.id,
          item_types.code,
          item_types.description,
          brands.name AS brand,
          locations.code AS location,
          inventory.quantity
        FROM inventory
        JOIN items ON inventory.item_id = items.id
        JOIN item_types ON items.item_type_id = item_types.id
        JOIN brands ON items.brand_id = brands.id
        JOIN locations ON inventory.location_id = locations.id
        ORDER BY item_types.code, brands.name
      `);

      return res.json(result.rows);
    }

    const result = await pool.query(
      `
      SELECT
        items.id,
        item_types.code,
        item_types.description,
        brands.name AS brand,
        locations.code AS location,
        inventory.quantity
      FROM inventory
      JOIN items ON inventory.item_id = items.id
      JOIN item_types ON items.item_type_id = item_types.id
      JOIN brands ON items.brand_id = brands.id
      JOIN locations ON inventory.location_id = locations.id
      WHERE
        item_types.code ILIKE $1
        OR item_types.description ILIKE $1
        OR brands.name ILIKE $1
        OR locations.code ILIKE $1
      ORDER BY item_types.code, brands.name
      `,
      [`%${q}%`]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.addStock = async (req, res) => {
  try {

    const { item_id, location_id, location_code, quantity } = req.body;

    let locationId = location_id;

    // create location if user typed a new one
    if (!locationId && location_code) {

      const checkLocation = await pool.query(
        `SELECT id FROM locations WHERE code = $1`,
        [location_code]
      );

      if (checkLocation.rows.length > 0) {
        locationId = checkLocation.rows[0].id;
      } else {

        const newLocation = await pool.query(
          `INSERT INTO locations (code)
           VALUES ($1)
           RETURNING id`,
          [location_code]
        );

        locationId = newLocation.rows[0].id;
      }
    }

    const result = await pool.query(
      `
      INSERT INTO inventory (item_id, location_id, quantity)
      VALUES ($1,$2,$3)
      ON CONFLICT (item_id, location_id)
      DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity
      RETURNING *
      `,
      [item_id, locationId, quantity]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.transferStock = async (req, res) => {

  const client = await pool.connect();

  try {

    const {
      item_id,
      from_location,
      to_location,
      to_location_code,
      quantity
    } = req.body;

    await client.query("BEGIN");

    let destinationId = to_location;

    // create location if user typed new one
    if (!destinationId && to_location_code) {

      const checkLocation = await client.query(
        `SELECT id FROM locations WHERE code = $1`,
        [to_location_code]
      );

      if (checkLocation.rows.length > 0) {

        destinationId = checkLocation.rows[0].id;

      } else {

        const newLocation = await client.query(
          `
          INSERT INTO locations (code)
          VALUES ($1)
          RETURNING id
          `,
          [to_location_code]
        );

        destinationId = newLocation.rows[0].id;
      }
    }

    // check stock at source
    const source = await client.query(
      `
      SELECT quantity
      FROM inventory
      WHERE item_id = $1 AND location_id = $2
      `,
      [item_id, from_location]
    );

    if (source.rows.length === 0) {
      throw new Error("No stock at source location");
    }

    if (source.rows[0].quantity < quantity) {
      throw new Error("Not enough stock");
    }

    // reduce source stock
    await client.query(
      `
      UPDATE inventory
      SET quantity = quantity - $1
      WHERE item_id = $2 AND location_id = $3
      `,
      [quantity, item_id, from_location]
    );

    // add stock to destination
    await client.query(
      `
      INSERT INTO inventory (item_id, location_id, quantity)
      VALUES ($1,$2,$3)
      ON CONFLICT (item_id, location_id)
      DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity
      `,
      [item_id, destinationId, quantity]
    );

    // record movement
    await client.query(
      `
      INSERT INTO stock_movements
      (item_id, from_location, to_location, quantity, movement_type)
      VALUES ($1,$2,$3,$4,'transfer')
      `,
      [item_id, from_location, destinationId, quantity]
    );

    await client.query("COMMIT");

    res.json({ message: "Stock transferred successfully" });

  } catch (err) {

    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message });

  } finally {

    client.release();

  }
};

exports.getItemLocations = async (req, res) => {
  try {

    const { itemId } = req.params;

    const result = await pool.query(
      `
      SELECT
        locations.id,
        locations.code,
        inventory.quantity
      FROM inventory
      JOIN locations ON inventory.location_id = locations.id
      WHERE inventory.item_id = $1
      AND inventory.quantity > 0
      ORDER BY locations.code
      `,
      [itemId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// =================================
// Get Item Location Summary
// (All locations with quantity of this item)
// =================================
exports.getItemLocationSummary = async (req, res) => {
  try {

    const { itemId } = req.params;

    const result = await pool.query(
      `
      SELECT
        locations.id,
        locations.code,
        COALESCE(inventory.quantity, 0) AS quantity
      FROM locations
      LEFT JOIN inventory
        ON inventory.location_id = locations.id
        AND inventory.item_id = $1
      ORDER BY locations.code
      `,
      [itemId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

