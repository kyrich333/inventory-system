const express = require("express");
const router = express.Router();

const inventoryController = require("../controllers/inventoryController");

router.get("/", inventoryController.getInventory);
router.get("/items", inventoryController.getItems);
router.get("/search", inventoryController.searchInventory);

module.exports = router;
