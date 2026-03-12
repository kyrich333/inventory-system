const pool = require("../db/db");

exports.getLocations = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT id, code
      FROM locations
      ORDER BY code
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};