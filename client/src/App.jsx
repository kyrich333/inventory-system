import { useEffect, useState } from "react";
import AddProductForm from "./components/AddProductForm";
import AddStockForm from "./components/AddStockForm";

function App() {

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");

  const [showProductForm, setShowProductForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);

  // Load all inventory
  const fetchInventory = async () => {
    try {
      const res = await fetch("http://localhost:5000/inventory");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Search inventory
  const searchInventory = async (value) => {
    try {

      const q = value || query;

      if (q.trim() === "") {
        fetchInventory();
        return;
      }

      const res = await fetch(
        `http://localhost:5000/inventory/search?q=${encodeURIComponent(q)}`
      );

      const data = await res.json();
      setItems(data);

    } catch (err) {
      console.error(err);
    }
  };

  // Load inventory on page load
  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>

      <h1>Inventory</h1>

      {/* SEARCH BAR */}
      <div style={{ marginBottom: "20px" }}>

        <input
          type="text"
          placeholder="Search code, description, brand, or location..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            searchInventory(e.target.value);
          }}
          style={{
            padding: "8px",
            marginRight: "10px",
            width: "300px"
          }}
        />

        <button
          onClick={() => searchInventory()}
          style={{
            padding: "8px 15px",
            marginRight: "10px",
            cursor: "pointer"
          }}
        >
          Search
        </button>

        <button
          onClick={() => setShowProductForm(true)}
          style={{
            padding: "8px 15px",
            marginRight: "10px",
            cursor: "pointer"
          }}
        >
          Add Product
        </button>

        <button
          onClick={() => setShowStockForm(true)}
          style={{
            padding: "8px 15px",
            marginRight: "10px",
            cursor: "pointer"
          }}
        >
          Add Stock
        </button>

        <button
          onClick={() => {
            setQuery("");
            fetchInventory();
          }}
          style={{
            padding: "8px 15px",
            cursor: "pointer"
          }}
        >
          Reset
        </button>

      </div>

      {/* PRODUCT FORM */}
      {showProductForm && (
        <AddProductForm onClose={() => setShowProductForm(false)} />
      )}

      {/* STOCK FORM */}
      {showStockForm && (
        <AddStockForm
          onClose={() => setShowStockForm(false)}
          refreshInventory={fetchInventory}
        />
      )}

      {/* INVENTORY TABLE */}
      <table
        border="1"
        cellPadding="10"
        style={{
          borderCollapse: "collapse",
          minWidth: "800px"
        }}
      >
        <thead>
          <tr>
            <th>Item ID</th>
            <th>Code</th>
            <th>Description</th>
            <th>Brand</th>
            <th>Location</th>
            <th>Quantity</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={`${item.id}-${item.location}`}>
              <td>{item.id}</td>
              <td>{item.code}</td>
              <td>{item.description}</td>
              <td>{item.brand}</td>
              <td>{item.location}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}

export default App;