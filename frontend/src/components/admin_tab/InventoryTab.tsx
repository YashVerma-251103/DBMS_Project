import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Inventory } from "../../types";
import API from "../../api";

const emptyInventory = { inventory_id: 0, facility_id: 0, item_name: "", quantity: "", price: "", supplier: "" };

const InventoryTab: React.FC = () => {
  const [searchParams, setSearchParams] = useState({ inventory_id: "", facility_id: "", item_name: "", supplier: "" });
  const [searchResults, setSearchResults] = useState<Inventory[]>([]);
  const [data, setData] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Inventory | null>(null);
  const [formData, setFormData] = useState<any>({ ...emptyInventory });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/inventory/search`);
      setData(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    const filtered = Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== ""));
    try {
      const res = await axios.get(`${API}/inventory/search`, { params: filtered });
      setSearchResults(res.data); setShowSearchResults(true);
    } catch { setSearchError("Error fetching inventory data."); setShowSearchResults(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdate = !!currentItem;
    const url = isUpdate ? `${API}/inventory/update` : `${API}/inventory/insert`;
    const method = isUpdate ? "PUT" : "POST";
    const params = new URLSearchParams({
      ...(isUpdate ? { inventory_id: String(formData.inventory_id) } : {}),
      facility_id: String(formData.facility_id), item_name: formData.item_name,
      quantity: String(formData.quantity), price: String(formData.price), supplier: formData.supplier,
    }).toString();
    try {
      const res = await fetch(`${url}?${params}`, { method });
      if (res.ok) { alert(`Inventory item ${isUpdate ? "updated" : "created"} successfully!`); fetchData(); setEditMode(false); setCurrentItem(null); }
      else { const err = await res.json(); alert(`Error: ${err.error}`); }
    } catch { alert("Failed."); }
  };

  const handleDelete = async (item: Inventory) => {
    if (!window.confirm("Delete this inventory item?")) return;
    await fetch(`${API}/inventory/delete?inventory_id=${item.inventory_id}`, { method: "DELETE" });
    fetchData();
  };

  const renderTable = (items: Inventory[]) => (
    <div className="table-responsive">
      <table>
        <thead><tr><th>Select</th><th>ID</th><th>Item</th><th>Facility</th><th>Quantity</th><th>Price</th><th>Supplier</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className={currentItem?.inventory_id === item.inventory_id ? "selected-row" : ""} onClick={() => setCurrentItem(item)}>
              <td><input type="radio" name="selectedItem" checked={currentItem?.inventory_id === item.inventory_id} onChange={() => setCurrentItem(item)} /></td>
              <td>{item.inventory_id}</td><td>{item.item_name}</td>
              <td>{item.facility_name ? `${item.facility_name} (#${item.facility_id})` : item.facility_id}</td>
              <td>{item.quantity ?? ""}</td><td>{item.price != null ? `₹${item.price}` : ""}</td><td>{item.supplier}</td>
              <td className="actions-cell">
                <button onClick={(e) => { e.stopPropagation(); setEditMode(true); setCurrentItem(item); setFormData({ ...emptyInventory, ...item }); }} className="btn-edit"><FaEdit /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }} className="btn-delete"><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ padding: "1rem" }}>
      <div className="table-header">
        <h3>INVENTORY MANAGEMENT</h3>
        <div className="action-buttons">
          <button onClick={() => { if (currentItem) { setEditMode(true); setFormData({ ...emptyInventory, ...currentItem }); } }} className="btn-update" disabled={!currentItem}><FaEdit /> Update Selected</button>
          <button onClick={() => { setEditMode(true); setCurrentItem(null); setFormData({ ...emptyInventory }); }} className="btn-primary"><FaPlus /> Add Item</button>
        </div>
      </div>

      <div className="search-inventory-container">
        <h4>Search Inventory</h4>
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group"><label>Inventory ID:</label><input type="text" value={searchParams.inventory_id} onChange={(e) => setSearchParams({ ...searchParams, inventory_id: e.target.value })} /></div>
          <div className="form-group"><label>Facility ID:</label><input type="text" value={searchParams.facility_id} onChange={(e) => setSearchParams({ ...searchParams, facility_id: e.target.value })} /></div>
          <div className="form-group"><label>Item Name:</label><input type="text" value={searchParams.item_name} onChange={(e) => setSearchParams({ ...searchParams, item_name: e.target.value })} /></div>
          <div className="form-group"><label>Supplier:</label><input type="text" value={searchParams.supplier} onChange={(e) => setSearchParams({ ...searchParams, supplier: e.target.value })} /></div>
          <div className="form-group">
            <button type="submit" className="btn-primary">Search</button>
            {showSearchResults && <button type="button" onClick={() => setShowSearchResults(false)} className="btn-secondary">Show All</button>}
          </div>
        </form>
        {searchError && <p className="error-message">{searchError}</p>}
      </div>

      {showSearchResults ? (
        <>{<h4>Results:</h4>}{searchResults.length > 0 ? renderTable(searchResults) : <p>No inventory items found.</p>}</>
      ) : loading ? (
        <div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>
      ) : data.length > 0 ? renderTable(data) : <p>No inventory items available.</p>}

      {editMode && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{currentItem ? "Edit Inventory Item" : "Create Inventory Item"}</h2>
            <form onSubmit={handleSubmit}>
              {currentItem && <div className="form-group"><label>Inventory ID</label><input type="text" value={formData.inventory_id} disabled /></div>}
              <div className="form-group"><label>Facility ID</label><input type="text" value={formData.facility_id} onChange={(e) => setFormData({ ...formData, facility_id: e.target.value })} required /></div>
              <div className="form-group"><label>Item Name</label><input type="text" value={formData.item_name} onChange={(e) => setFormData({ ...formData, item_name: e.target.value })} required /></div>
              <div className="form-group"><label>Quantity</label><input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} /></div>
              <div className="form-group"><label>Price</label><input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} /></div>
              <div className="form-group"><label>Supplier</label><input type="text" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} /></div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTab;
