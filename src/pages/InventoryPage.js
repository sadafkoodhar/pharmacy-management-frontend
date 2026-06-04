import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Config } from '../config';
import ExcelImport from '../components/ExcelImport';

const InventoryPage = () => {
    const [medicines, setMedicines] = useState([]);
    const [isLowStockFilter, setIsLowStockFilter] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);
    const [editingMed, setEditingMed] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [medToDelete, setMedToDelete] = useState(null);

    const fetchMedicines = async () => {
        try {
            const res = await axios.get(`${Config.CORE_API}/medicines/all`);
            if (res.data.message === "SUCCESS!") {
                setMedicines(res.data.data);
                setCurrentPage(1);
            }
        } catch (err) { console.error("Error fetching data", err); }
    };

    const fetchLowStock = async () => {
        try {
            const res = await axios.get(`${Config.CORE_API}/medicines/low-stock`);
            if (res.data.message === "SUCCESS!") {
                setMedicines(res.data.data.lowStockMedicines);
                setIsLowStockFilter(true);
                setCurrentPage(1);
            }
        } catch (err) { console.error("Error fetching low stock", err); }
    };

    useEffect(() => { fetchMedicines(); }, []);

    const handleResetFilter = () => {
        fetchMedicines();
        setIsLowStockFilter(false);
    };

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

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${Config.CORE_API}/medicines/update/${editingMed.id}`, editingMed);
            setEditingMed(null);
            fetchMedicines();
        } catch (err) { alert("Update failed!"); }
    };

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = medicines.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(medicines.length / recordsPerPage);

    return (
        <div className="page-container">
            <div className="header-section">
                <h1>Inventory Management</h1>
                <ExcelImport onImportSuccess={fetchMedicines} />
            </div>

            <div className="filter-section">
                {!isLowStockFilter ? (
                    <button onClick={fetchLowStock} className="action-btn warning-btn">⚠️ Show Low Stock Only</button>
                ) : (
                    <button onClick={handleResetFilter} className="action-btn success-btn">🔄 Show All Inventory</button>
                )}
            </div>

            <div className="card-wrapper">
                <div className="table-responsive-scroll">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Stock</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.length > 0 ? (
                                currentRecords.map(m => (
                                    <tr key={m.id}>
                                        <td data-label="Name"><b>{m.name}</b></td>
                                        <td data-label="Stock">{m.quantity}</td>
                                        <td data-label="Price">Rs. {m.salePrice}</td>
                                        <td data-label="Actions">
                                            <div className="actions-flex-group">
                                                <button onClick={() => setEditingMed(m)} className="edit-mini-btn">Edit</button>
                                                <button onClick={() => openDeleteModal(m.id)} className="delete-mini-btn">Delete</button>
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

                {totalPages > 1 && (
                    <div className="pagination-wrapper">
                        <button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="nav-btn">⬅️ Previous</button>
                        <span className="page-indicator">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="nav-btn">Next ➡️</button>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal-overlay-bg">
                    <div className="modal-card">
                        <span onClick={() => setShowDeleteModal(false)} className="modal-close-x">&times;</span>
                        <div className="modal-body">
                            <h2>Delete Item</h2>
                            <p>Are you sure you want to delete this medicine record?</p>
                            <hr className="modal-hr" />
                            <div className="modal-buttons-stack">
                                <button onClick={() => setShowDeleteModal(false)} className="modal-btn cancel-gray">Cancel</button>
                                <button onClick={confirmDelete} className="modal-btn delete-red">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingMed && (
                <div className="modal-overlay-bg">
                    <div className="modal-card">
                        <span onClick={() => setEditingMed(null)} className="modal-close-x">&times;</span>
                        <div className="modal-body">
                            <h2>Edit Medicine</h2>
                            <p>Update information for <b>{editingMed.name}</b></p>
                            <hr className="modal-hr" />
                            <form onSubmit={handleUpdateSubmit} className="modal-form">
                                <label>Medicine Name</label>
                                <input type="text" value={editingMed.name} onChange={(e) => setEditingMed({...editingMed, name: e.target.value})} required />

                                <label>Stock Quantity</label>
                                <input type="number" value={editingMed.quantity} onChange={(e) => setEditingMed({...editingMed, quantity: e.target.value})} required />

                                <label>Sale Price</label>
                                <input type="number" value={editingMed.salePrice} onChange={(e) => setEditingMed({...editingMed, salePrice: e.target.value})} required />

                                <div className="modal-buttons-stack">
                                    <button type="button" onClick={() => setEditingMed(null)} className="modal-btn cancel-gray">Cancel</button>
                                    <button type="submit" className="modal-btn save-green">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* 🌟 POORA GLOBAL RESPONSIVE CSS INJECTION FOR INVENTORY 🌟 */}
            <style>{`
                .page-container { padding: 15px; margin: 0 auto; maxWidth: 1200px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-sizing: border-box; }
                .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
                .header-section h1 { margin: 0; font-size: calc(1.5rem + 0.5vw); color: #1a3a5f; }
                .filter-section { margin-bottom: 20px; }
                .action-btn { border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; width: auto; font-size: 14px; }
                .warning-btn { background: #5d67f6; color: white; }
                .success-btn { background: #2ecc71; color: white; }
                .card-wrapper { background: white; padding: 20px; borderRadius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); box-sizing: border-box; }
                .table-responsive-scroll { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
                .custom-table { width: 100%; border-collapse: collapse; min-width: 500px; text-align: left; }
                .custom-table th { padding: 12px; color: #4a5568; border-bottom: 2px solid #edf2f7; font-size: 14px; }
                .custom-table td { padding: 12px; border-bottom: 1px solid #f1f1f1; font-size: 14px; color: #333; }
                .actions-flex-group { display: flex; gap: 8px; }
                .edit-mini-btn { background: #2ecc71; color: white; border: none; padding: 6px 14px; cursor: pointer; border-radius: 4px; font-weight: bold; }
                .delete-mini-btn { background: #5d67f6;; color: white; border: none; padding: 6px 14px; cursor: pointer; border-radius: 4px; font-weight: bold; }
                .pagination-wrapper { display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 25px; flex-wrap: wrap; }
                .nav-btn { background: #5d67f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 13px; }
                .nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .page-indicator { font-weight: bold; font-size: 13px; }
                .modal-overlay-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; justify-content: center; align-items: center; padding: 10px; box-sizing: border-box; }
                .modal-card { background: white; width: 100%; max-width: 460px; border-radius: 8px; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: fadeIn 0.2s ease-out; }
                .modal-close-x { position: absolute; right: 15px; top: 10px; font-size: 28px; font-weight: bold; cursor: pointer; color: #aaa; line-height: 1; }
                .modal-body { padding: 25px; text-align: center; box-sizing: border-box; }
                .modal-body h2 { margin: 0 0 10px 0; font-size: 20px; color: #2c3e50; }
                .modal-body p { margin: 0 0 15px 0; color: #718096; font-size: 14px; }
                .modal-hr { border: 0; border-top: 1px solid #edf2f7; margin-bottom: 15px; }
                .modal-buttons-stack { display: flex; gap: 10px; width: 100%; }
                .modal-btn { padding: 12px; border: none; cursor: pointer; width: 100%; border-radius: 6px; font-weight: bold; font-size: 14px; }
                .cancel-gray { background: #edf2f7; color: #4a5568; }
                .delete-red { background: #5d67f6;; color: white; }
                .save-green { background: #04AA6D; color: white; }
                .modal-form { text-align: left; }
                .modal-form label { display: block; font-weight: bold; margin-bottom: 5px; font-size: 13px; color: #4a5568; }
                .modal-form input { width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #cbd5e0; border-radius: 4px; box-sizing: border-box; font-size: 14px; }
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @media (max-width: 600px) {
                    .header-section { flex-direction: column; align-items: flex-start; }
                    .header-section > * { width: 100% !important; }
                    .action-btn { width: 100%; text-align: center; }
                    .modal-buttons-stack { flex-direction: column; }
                    .pagination-wrapper { justify-content: space-between; width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default InventoryPage;