const pool = require("../db/db");

exports.getProducts = async (req, res) => {
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
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};


exports.createProduct = async (req, res) => {
  try {

    const { brand_id, brand_name, code, description } = req.body;

    let brandId = brand_id;

    // 1️⃣ Find or create brand
    if (!brandId && brand_name) {

      const brandCheck = await pool.query(
        `SELECT id FROM brands WHERE name = $1`,
        [brand_name]
      );

      if (brandCheck.rows.length > 0) {
        brandId = brandCheck.rows[0].id;
      } else {
        const newBrand = await pool.query(
          `INSERT INTO brands (name)
           VALUES ($1)
           RETURNING id`,
          [brand_name]
        );

        brandId = newBrand.rows[0].id;
      }
    }

    // 2️⃣ Find or create item type
    let itemTypeId;

    const typeCheck = await pool.query(
      `SELECT id FROM item_types WHERE code = $1`,
      [code]
    );

    if (typeCheck.rows.length > 0) {
      itemTypeId = typeCheck.rows[0].id;
    } else {
      const newType = await pool.query(
        `INSERT INTO item_types (code, description)
         VALUES ($1,$2)
         RETURNING id`,
        [code, description]
      );

      itemTypeId = newType.rows[0].id;
    }

    // 3️⃣ Check if item already exists
    const itemCheck = await pool.query(
      `
      SELECT id
      FROM items
      WHERE item_type_id = $1 AND brand_id = $2
      `,
      [itemTypeId, brandId]
    );

    if (itemCheck.rows.length > 0) {
      return res.status(400).json({
        message: "Product already exists"
      });
    }

    // 4️⃣ Create item
    const newItem = await pool.query(
      `
      INSERT INTO items (item_type_id, brand_id)
      VALUES ($1,$2)
      RETURNING *
      `,
      [itemTypeId, brandId]
    );

    res.json(newItem.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};