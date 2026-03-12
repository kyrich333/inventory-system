const pool = require("../db/db");

exports.getBrands = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name
      FROM brands
      ORDER BY name
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};