import { useState, useEffect } from "react";

function TransferStockForm({ onClose, refreshInventory }) {

  const [items, setItems] = useState([]);
  const [fromLocations, setFromLocations] = useState([]);
  const [allLocations, setAllLocations] = useState([]);

  const [itemId, setItemId] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [quantity, setQuantity] = useState("");

  const [availableQty, setAvailableQty] = useState(0);
  const [error, setError] = useState("");

  // Load products
  const fetchItems = async () => {
    const res = await fetch("http://localhost:5000/products");
    const data = await res.json();
    setItems(data);
  };

  // Load all locations
  const fetchLocations = async () => {
    const res = await fetch("http://localhost:5000/locations");
    const data = await res.json();
    setAllLocations(data);
  };

  // Load locations where item exists
  const fetchItemLocations = async (id) => {

    if (!id) return;

    const res = await fetch(
      `http://localhost:5000/inventory/item-locations/${id}`
    );

    const data = await res.json();
    setFromLocations(data);
  };

  useEffect(() => {
    fetchItems();
    fetchLocations();
  }, []);

  const handleQuantityChange = (value) => {

    const num = Number(value);

    if (num > availableQty) {
      setError(`Only ${availableQty} available`);
    } else {
      setError("");
    }

    setQuantity(value);
  };

  const transferStock = async () => {

    if (!itemId || !fromLocation || (!toLocation && !newLocation) || !quantity) {
      alert("Please complete all fields");
      return;
    }

    if (Number(quantity) > availableQty) {
      alert(`Cannot transfer more than ${availableQty}`);
      return;
    }

    await fetch("http://localhost:5000/inventory/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        item_id: Number(itemId),
        from_location: Number(fromLocation),
        to_location: toLocation ? Number(toLocation) : null,
        to_location_code: newLocation || null,
        quantity: Number(quantity)
      })
    });

    refreshInventory();
    onClose();
  };

  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "20px",
      marginTop: "20px",
      maxWidth: "400px"
    }}>

      <h3>Transfer Stock</h3>

      {/* PRODUCT */}
      <label>Product</label>
      <select
        value={itemId}
        onChange={(e) => {
          const id = e.target.value;
          setItemId(id);
          fetchItemLocations(id);
        }}
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

      {/* FROM LOCATION */}
      <label>From Location</label>
      <select
        value={fromLocation}
        onChange={(e) => {

          const id = e.target.value;
          setFromLocation(id);

          const loc = fromLocations.find(l => l.id == id);

          if (loc) {
            setAvailableQty(loc.quantity);
          }

        }}
        style={{ width: "100%", padding: "8px" }}
      >
        <option value="">Select Source</option>

        {fromLocations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.code} ({loc.quantity})
          </option>
        ))}

      </select>

      <p style={{ fontSize: "12px", color: "gray" }}>
        Available: {availableQty}
      </p>

      {/* TO LOCATION */}
      <label>To Location</label>
      <select
        value={toLocation}
        onChange={(e) => {
          const id = e.target.value;
          setToLocation(id);
          setNewLocation("");

          const loc = allLocations.find(l => l.id == id);

          if (loc) {
            setAvailableQty(loc.quantity);
          }

        }}
        style={{ width: "100%", padding: "8px" }}
      >
        <option value="">Select Destination</option>

        {fromLocations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.code} ({loc.quantity})
          </option>
        ))}

      </select>

      <p style={{ textAlign: "center" }}>or</p>

      <input
        type="text"
        placeholder="New Location Code"
        value={newLocation}
        onChange={(e) => {
          setNewLocation(e.target.value);
          setToLocation("");
        }}
        style={{ width: "100%", padding: "8px" }}
      />

      <br /><br />

      {/* QUANTITY */}
      <label>Quantity</label>
      <input
        type="number"
        value={quantity}
        onChange={(e) => handleQuantityChange(e.target.value)}
        style={{ width: "100%", padding: "8px" }}
      />

      {error && (
        <p style={{ color: "red", fontSize: "12px" }}>
          {error}
        </p>
      )}

      <br />

      <button onClick={transferStock}>Transfer</button>
      <button onClick={onClose} style={{ marginLeft: "10px" }}>
        Cancel
      </button>

    </div>
  );
}

export default TransferStockForm;