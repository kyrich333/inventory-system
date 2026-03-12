const express = require("express");
const router = express.Router();

const inventoryController = require("../controllers/inventoryController");

router.get("/", inventoryController.getInventory);
router.get("/items", inventoryController.getItems);
router.get("/search", inventoryController.searchInventory);
router.post("/stock", inventoryController.addStock);
router.post("/transfer", inventoryController.transferStock);

router.get("/item-locations/:itemId", inventoryController.getItemLocations);
router.get("/item-location-summary/:itemId", inventoryController.getItemLocationSummary);

module.exports = router;
