import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Config } from '../config';
import ExcelImport from '../components/ExcelImport';

const InventoryPage = () => {
    const [medicines, setMedicines] = useState([]);
    const [isLowStockFilter, setIsLowStockFilter] = useState(false);

    // --- PAGINATION STATES ---
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);

    // --- MODAL STATES ---
    const [editingMed, setEditingMed] = useState(null); // Edit modal ke liye
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Delete modal visibility
    const [medToDelete, setMedToDelete] = useState(null); // ID track karne ke liye

    // --- 1. FETCH ALL MEDICINES ---
    const fetchMedicines = async () => {
        try {
            const res = await axios.get(`${Config.CORE_API}/medicines/all`);
            if (res.data.message === "SUCCESS!") {
                setMedicines(res.data.data);
                setCurrentPage(1); // Reset to first page on fresh fetch
            }
        } catch (err) { console.error("Error fetching data", err); }
    };

    // --- 2. FETCH LOW STOCK ---
    const fetchLowStock = async () => {
        try {
            const res = await axios.get(`${Config.CORE_API}/medicines/low-stock`);
            if (res.data.message === "SUCCESS!") {
                setMedicines(res.data.data.lowStockMedicines);
                setIsLowStockFilter(true);
                setCurrentPage(1); // Reset to first page on filter
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

    // --- 5. PAGINATION LOGIC ---
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    
    // Current page ke 10 records slice karna
    const currentRecords = medicines.slice(indexOfFirstRecord, indexOfLastRecord);
    
    // Total pages calculate karna
    const totalPages = Math.ceil(medicines.length / recordsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <div style={{ padding: '15px', margin: '0 auto', maxWidth: '1200px', fontFamily: 'Arial, Helvetica, sans-serif', boxSizing: 'border-box' }}>
            
            {/* 🌟 MODIFIED: Added responsive flex layout class for header */}
            <div className="inventory-header">
                <h1 style={{ margin: '0 0 15px 0', fontSize: 'calc(1.5rem + 0.5vw)' }}>Inventory Management</h1>
                <ExcelImport onImportSuccess={fetchMedicines} />
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                {!isLowStockFilter ? (
                    <button onClick={fetchLowStock} className="full-width-mobile-btn" style={lowStockBtnStyle}>⚠️ Show Low Stock Only</button>
                ) : (
                    <button onClick={handleResetFilter} className="full-width-mobile-btn" style={resetBtnStyle}>🔄 Show All Inventory</button>
                )
            }
            </div>

            {/* Main Table Container */}
            <div style={{ background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
                
                {/* 🌟 MODIFIED: Scroll Wrapper around the table */}
                <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table width="100%" style={{ borderCollapse: 'collapse', minWidth: '500px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                <th style={thStyle}>Name</th>
                                <th style={thStyle}>Stock</th>
                                <th style={thStyle}>Price</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.length > 0 ? (
                                currentRecords.map(m => (
                                    <tr key={m.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                                        <td style={tdStyle}>{m.name}</td>
                                        <td style={tdStyle}>{m.quantity}</td>
                                        <td style={tdStyle}>{m.salePrice}</td>
                                        <td style={tdStyle}>
                                            {/* 🌟 MODIFIED: Flex grouping for small screen buttons alignment */}
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button onClick={() => setEditingMed(m)} style={editBtnStyle}>Edit</button>
                                                <button onClick={() => openDeleteModal(m.id)} style={deleteBtnStyle}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- PAGINATION CONTROLS --- */}
                {totalPages > 1 && (
                    <div style={paginationContainerStyle} className="pagination-responsive">
                        <button 
                            onClick={prevPage} 
                            disabled={currentPage === 1} 
                            style={{ ...paginationBtnStyle, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            ⬅️ Prev
                        </button>
                        
                        <span style={{ fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            Page {currentPage} of {totalPages}
                        </span>

                        <button 
                            onClick={nextPage} 
                            disabled={currentPage === totalPages} 
                            style={{ ...paginationBtnStyle, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                        >
                            Next ➡️
                        </button>
                    </div>
                )}
            </div>

            {/* --- RESPONSIVE DELETE MODAL --- */}
            {showDeleteModal && (
                <div style={modalOverlay}>
                    <div style={modalContent} className="modal-responsive-box">
                        <span onClick={() => setShowDeleteModal(false)} style={closeIcon}>&times;</span>
                        <div style={containerStyle}>
                            <h2 style={{ fontSize: '1.4rem', margin: '10px 0' }}>Delete Item</h2>
                            <p style={{ fontSize: '14px', color: '#555' }}>Are you sure you want to delete this medicine record?</p>
                            <hr style={hrStyle} />
                            <div style={clearfixStyle} className="modal-clearfix-responsive">
                                <button onClick={() => setShowDeleteModal(false)} style={cancelBtn}>Cancel</button>
                                <button onClick={confirmDelete} style={deleteBtn}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- RESPONSIVE EDIT MODAL --- */}
            {editingMed && (
                <div style={modalOverlay}>
                    <div style={editModalBox} className="modal-responsive-box">
                        <span onClick={() => setEditingMed(null)} style={closeIcon}>&times;</span>
                        <div style={containerStyle}>
                            <h2 style={{ fontSize: '1.4rem', margin: '10px 0' }}>Edit Medicine</h2>
                            <p style={{ fontSize: '14px', color: '#555' }}>Update information for <b>{editingMed.name}</b></p>
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

                                <div style={clearfixStyle} className="modal-clearfix-responsive">
                                    <button type="button" onClick={() => setEditingMed(null)} style={cancelBtn}>Cancel</button>
                                    <button type="submit" style={saveBtn}>Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* 🌟 Custom Global CSS Injection for Inventory Specific Media Queries */}
            <style>
                {`
                    .inventory-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 30px;
                        flex-wrap: wrap;
                        gap: 15px;
                    }
                    @media (max-width: 768px) {
                        .inventory-header {
                            flex-direction: column;
                            align-items: flex-start;
                        }
                        .inventory-header > * {
                            width: 100% !important;
                        }
                        .full-width-mobile-btn {
                            width: 100%;
                            text-align: center;
                        }
                        .modal-responsive-box {
                            width: 90% !important;
                            max-width: 450px;
                            margin: 0 15px;
                        }
                        .modal-clearfix-responsive {
                            flex-direction: column;
                            gap: 10px;
                        }
                        .pagination-responsive {
                            width: 100%;
                            justify-content: space-between !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

// --- STYLES OBJECTS ---
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(71, 78, 93, 0.85)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalContent = { background: '#fefefe', width: '450px', borderRadius: '8px', position: 'relative', border: '1px solid #ddd', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' };
const editModalBox = { background: '#fefefe', width: '480px', borderRadius: '8px', position: 'relative', border: '1px solid #ddd', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' };
const containerStyle = { padding: '20px', textAlign: 'center' };
const closeIcon = { position: 'absolute', right: '15px', top: '5px', fontSize: '30px', fontWeight: 'bold', cursor: 'pointer', color: '#aaa' };

const hrStyle = { border: '1px solid #f1f1f1', marginBottom: '15px' };
const labelStyle = { display: 'block', textAlign: 'left', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px', color: '#333' };
const inputStyle = { width: '100%', padding: '10px', margin: '4px 0 15px 0', display: 'inline-block', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };

const clearfixStyle = { display: 'flex', gap: '10px', marginTop: '10px' };
const cancelBtn = { background: '#ccc', color: 'black', padding: '12px 20px', border: 'none', cursor: 'pointer', width: '100%', borderRadius: '4px', fontWeight: 'bold' };
const deleteBtn = { background: '#5d67f6', color: 'white', padding: '12px 20px', border: 'none', cursor: 'pointer', width: '100%', borderRadius: '4px', fontWeight: 'bold' };
const saveBtn = { background: '#04AA6D', color: 'white', padding: '12px 20px', border: 'none', cursor: 'pointer', width: '100%', borderRadius: '4px', fontWeight: 'bold' };

const thStyle = { padding: '12px 8px', color: '#555', borderBottom: '2px solid #eee' };
const tdStyle = { padding: '12px 8px', color: '#333' };
const editBtnStyle = { background: '#2ecc71', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' };
const deleteBtnStyle = { background: '#5d67f6', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }; 
const lowStockBtnStyle = { background: '#5d67f6', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const resetBtnStyle = { background: '#2ecc71', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };

const paginationContainerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' };
const paginationBtnStyle = { background: '#5d67f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold' };

export default InventoryPage;