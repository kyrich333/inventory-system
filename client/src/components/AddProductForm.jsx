import { useState, useEffect } from "react";

function AddProductForm({ onClose }) {
  const [brands, setBrands] = useState([]);
  const [brandId, setBrandId] = useState("");
  const [brandName, setBrandName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  // load brands
  const fetchBrands = async () => {
    const res = await fetch("http://localhost:5000/brands");
    const data = await res.json();
    setBrands(data);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const createProduct = async () => {
    try {
      await fetch("http://localhost:5000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand_id: brandId || null,
          brand_name: brandName || null,
          code,
          description,
        }),
      });

      alert("Product created");
      onClose();

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "15px" }}>
      <h3>Add Product</h3>

      <label>Existing Brand</label>
      <select
        value={brandId}
        onChange={(e) => {
          setBrandId(e.target.value);
          setBrandName("");
        }}
      >
        <option value="">Select Brand</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>

      <p>or</p>

      <label>New Brand</label>
      <input
        type="text"
        placeholder="Enter new brand"
        value={brandName}
        onChange={(e) => {
          setBrandName(e.target.value);
          setBrandId("");
        }}
      />

      <input
        type="text"
        placeholder="Item Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button onClick={createProduct}>Create</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}

export default AddProductForm;