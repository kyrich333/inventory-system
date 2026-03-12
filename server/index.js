require("dotenv").config();

const express = require("express");
const cors = require("cors");

const inventoryRoutes = require("./routes/inventoryRoute");
const productRoutes = require("./routes/productRoutes");
const brandRoutes = require("./routes/brandRoutes");
const locationRoutes = require("./routes/locationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => 
  {
  res.send("Inventory API is running");
  });

app.use("/inventory", inventoryRoutes);
app.use("/products", productRoutes);
app.use("/brands", brandRoutes);
app.use("/locations", locationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});