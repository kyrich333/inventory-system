import { useState, useEffect } from "react";

function AddStockForm({ onClose, refreshInventory }) {

  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);

  const [itemId, setItemId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [locationCode, setLocationCode] = useState("");
  const [quantity, setQuantity] = useState("");

  // Load products
  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load locations
  const fetchLocations = async () => {
    try {
      const res = await fetch("http://localhost:5000/locations");
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchLocations();
  }, []);

  const addStock = async () => {

    // Validation
    if (!itemId) {
      alert("Please select a product");
      return;
    }

    if (!locationId && !locationCode) {
      alert("Please select or create a location");
      return;
    }

    if (!quantity || quantity <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    try {

      await fetch("http://localhost:5000/inventory/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_id: Number(itemId),
          location_id: locationId ? Number(locationId) : null,
          location_code: locationCode || null,
          quantity: Number(quantity)
        }),
      });

      await fetchLocations(); // refresh location dropdown
      refreshInventory();     // refresh inventory table
      onClose();

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "20px",
        marginTop: "20px",
        maxWidth: "400px"
      }}
    >

      <h3>Add Stock</h3>

      {/* PRODUCT */}
      <label>Product</label>
      <br />

      <select
        value={itemId}
        onChange={(e) => setItemId(e.target.value)}
        style={{ width: "100%", padding: "8px" }}
      >
        <option value="">Select Product</option>

        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.brand} {item.code}
          </option>
        ))}
      </select>

      <br /><br />

      {/* EXISTING LOCATION */}
      <label>Existing Location</label>
      <br />

      <select
        value={locationId}
        onChange={(e) => {
          setLocationId(e.target.value);
          setLocationCode("");
        }}
        style={{ width: "100%", padding: "8px" }}
      >
        <option value="">Select Location</option>

        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.code}
          </option>
        ))}
      </select>

      <p style={{ textAlign: "center" }}>or</p>

      {/* NEW LOCATION */}
      <label>New Location Code</label>
      <br />

      <input
        type="text"
        placeholder="WH-2-B3"
        value={locationCode}
        onChange={(e) => {
          setLocationCode(e.target.value);
          setLocationId("");
        }}
        style={{ width: "100%", padding: "8px" }}
      />

      <br /><br />

      {/* QUANTITY */}
      <label>Quantity</label>
      <br />

      <input
        type="number"
        placeholder="10"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        style={{ width: "100%", padding: "8px" }}
      />

      <br /><br />

      {/* BUTTONS */}
      <button
        onClick={addStock}
        style={{
          padding: "8px 15px",
          marginRight: "10px",
          cursor: "pointer"
        }}
      >
        Add Stock
      </button>

      <button
        onClick={onClose}
        style={{
          padding: "8px 15px",
          cursor: "pointer"
        }}
      >
        Cancel
      </button>

    </div>
  );
}

export default AddStockForm;