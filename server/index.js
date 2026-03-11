require("dotenv").config();

const express = require("express");
const cors = require("cors");

const inventoryRoutes = require("./routes/inventoryRoute");
//console.log(inventoryRoutes);
const app = express();

app.use(cors());
app.use(express.json());

app.use("/inventory", inventoryRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});