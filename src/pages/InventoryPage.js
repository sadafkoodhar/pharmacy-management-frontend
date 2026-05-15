import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Config } from '../config';
import ExcelImport from '../components/ExcelImport';

const InventoryPage = () => {
    const [medicines, setMedicines] = useState([]);
    const [isLowStockFilter, setIsLowStockFilter] = useState(false);

    // --- MODAL STATES ---
    const [editingMed, setEditingMed] = useState(null); // Edit modal ke liye
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Delete modal visibility
    const [medToDelete, setMedToDelete] = useState(null); // ID track karne ke liye

    // --- 1. FETCH ALL MEDICINES ---
    const fetchMedicines = async () => {
        try {
            const res = await axios.get(`${Config.CORE_API}/medicines/all`);
            if (res.data.message === "SUCCESS!") setMedicines(res.data.data);
        } catch (err) { console.error("Error fetching data", err); }
    };

    // --- 2. FETCH LOW STOCK ---
    const fetchLowStock = async () => {
        try {
            const res = await axios.get(`${Config.CORE_API}/medicines/low-stock`);
            if (res.data.message === "SUCCESS!") {
                setMedicines(res.data.data.lowStockMedicines);
                setIsLowStockFilter(true);
            }
        } catch (err) { console.error("Error fetching low stock", err); }
    };

    useEffect(() => { fetchMedicines(); }, []);

    const handleResetFilter = () => {
        fetchMedicines();
        setIsLowStockFilter(false);
    };

    // --- 3. DELETE LOGIC ---
    const openDeleteModal = (id) => {
        setMedToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${Config.CORE_API}/medicines/delete/${medToDelete}`);
            setShowDeleteModal(false);
            fetchMedicines();
        } catch (err) { alert("Delete failed!"); }
    };

    // --- 4. UPDATE LOGIC ---
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${Config.CORE_API}/medicines/update/${editingMed.id}`, editingMed);
            setEditingMed(null);
            fetchMedicines();
        } catch (err) { alert("Update failed!"); }
    };

    return (
        <div style={{ padding: '20px',margin:'20px' ,fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '110px' }}>
                <h1>Inventory Management</h1>
                <ExcelImport onImportSuccess={fetchMedicines} />
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                {!isLowStockFilter ? (
                    <button onClick={fetchLowStock} style={lowStockBtnStyle}>⚠️ Show Low Stock Only</button>
                ) : (
                    <button onClick={handleResetFilter} style={resetBtnStyle}>🔄 Show All Inventory</button>
                )}
            </div>

            {/* Main Table */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <table width="100%" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Stock</th>
                            <th style={thStyle}>Price</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {medicines.map(m => (
                            <tr key={m.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                                <td style={tdStyle}>{m.name}</td>
                                <td style={tdStyle}>{m.quantity}</td>
                                <td style={tdStyle}>{m.salePrice}</td>
                                <td style={tdStyle}>
                                    <button onClick={() => setEditingMed(m)} style={editBtnStyle}>Edit</button>
                                    <button onClick={() => openDeleteModal(m.id)} style={deleteBtnStyle}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- PROFESSIONAL DELETE MODAL --- */}
            {showDeleteModal && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <span onClick={() => setShowDeleteModal(false)} style={closeIcon}>&times;</span>
                        <div style={containerStyle}>
                            <h1>Delete Item</h1>
                            <p>Are you sure you want to delete this medicine record?</p>
                            <hr style={hrStyle} />
                            <div style={clearfixStyle}>
                                <button onClick={() => setShowDeleteModal(false)} style={cancelBtn}>Cancel</button>
                                <button onClick={confirmDelete} style={deleteBtn}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PROFESSIONAL EDIT MODAL --- */}
            {editingMed && (
                <div style={modalOverlay}>
                    <div style={editModalBox}>
                        <span onClick={() => setEditingMed(null)} style={closeIcon}>&times;</span>
                        <div style={containerStyle}>
                            <h1>Edit Medicine</h1>
                            <p>Update information for <b>{editingMed.name}</b></p>
                            <hr style={hrStyle} />
                            
                            <form onSubmit={handleUpdateSubmit} style={{ textAlign: 'left' }}>
                                <label style={labelStyle}>Medicine Name</label>
                                <input 
                                    style={inputStyle}
                                    type="text" 
                                    value={editingMed.name} 
                                    onChange={(e) => setEditingMed({...editingMed, name: e.target.value})} 
                                />

                                <label style={labelStyle}>Stock Quantity</label>
                                <input 
                                    style={inputStyle}
                                    type="number" 
                                    value={editingMed.quantity} 
                                    onChange={(e) => setEditingMed({...editingMed, quantity: e.target.value})} 
                                />

                                <label style={labelStyle}>Sale Price</label>
                                <input 
                                    style={inputStyle}
                                    type="number" 
                                    value={editingMed.salePrice} 
                                    onChange={(e) => setEditingMed({...editingMed, salePrice: e.target.value})} 
                                />

                                <div style={clearfixStyle}>
                                    <button type="button" onClick={() => setEditingMed(null)} style={cancelBtn}>Cancel</button>
                                    <button type="submit" style={saveBtn}>Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- STYLES OBJECTS ---
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(71, 78, 93, 0.9)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalContent = { background: '#fefefe', width: '450px', borderRadius: '5px', position: 'relative', border: '1px solid #888' };
const editModalBox = { background: '#fefefe', width: '500px', borderRadius: '5px', position: 'relative', border: '1px solid #888' };
const containerStyle = { padding: '24px', textAlign: 'center' };
const closeIcon = { position: 'absolute', right: '20px', top: '10px', fontSize: '35px', fontWeight: 'bold', cursor: 'pointer', color: '#aaa' };

const hrStyle = { border: '1px solid #f1f1f1', marginBottom: '20px' };
const labelStyle = { display: 'block', textAlign: 'left', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '12px', margin: '8px 0 18px 0', display: 'inline-block', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };

const clearfixStyle = { display: 'flex', gap: '10px', marginTop: '10px' };
const cancelBtn = { background: '#ccc', color: 'black', padding: '14px 20px', border: 'none', cursor: 'pointer', width: '100%', opacity: '0.9', fontWeight: 'bold' };
const deleteBtn = { background: '#f44336', color: 'white', padding: '14px 20px', border: 'none', cursor: 'pointer', width: '100%', opacity: '0.9', fontWeight: 'bold' };
const saveBtn = { background: '#04AA6D', color: 'white', padding: '14px 20px', border: 'none', cursor: 'pointer', width: '100%', opacity: '0.9', fontWeight: 'bold' };

const thStyle = { padding: '12px 8px' };
const tdStyle = { padding: '12px 8px' };
const editBtnStyle = { background: '#2ecc71', color: 'white', border: 'none', padding: '6px 12px', marginRight: '8px', cursor: 'pointer', borderRadius: '4px' };
const deleteBtnStyle = { background: '#5d67f6', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' };
const lowStockBtnStyle = { background: '#5d67f6', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const resetBtnStyle = { background: '#2ecc71', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };

export default InventoryPage;