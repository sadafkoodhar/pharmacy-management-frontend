import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Config } from '../config';
import Dashboard from '../components/Dashboard';

const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState({ 
        todayRevenue: 0, todayLowStockCount: 0, todayBillCount: 0, totalProfit: 0, totalLoss: 0
    });
    const [medicines, setMedicines] = useState([]); 
    const [expiringSoon, setExpiringSoon] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);

    useEffect(() => {
        const loadAllData = async () => {
            try {
                setError(null);
                const [dashRes, medRes, expiryRes] = await Promise.all([
                    axios.get(`${Config.CORE_API}/reports/dashboard`),
                    axios.get(`${Config.CORE_API}/medicines/all`),
                    axios.get(`${Config.CORE_API}/medicines/expiringSoon`) 
                ]);

                if (dashRes.data.message === "SUCCESS!") setDashboardData(dashRes.data.data);
                if (medRes.data.message === "SUCCESS!") setMedicines(medRes.data.data);
                if (expiryRes.data.message === "SUCCESS!") setExpiringSoon(expiryRes.data.data);
            } catch (err) {
                console.error("Dashboard API Error:", err);
                setError("Backend se connection nahi ho saka.");
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, []);

    if (loading) return <h2 className="status-msg">Loading Pharmacy System...</h2>;
    if (error) return <h2 className="status-msg error-msg">{error}</h2>;

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = medicines.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(medicines.length / recordsPerPage);

    return (
        <div className="dashboard-container">
            <h1 className="main-title">Pharmacy Management System</h1>

            <Dashboard stats={dashboardData} />

            {expiringSoon.length > 0 && (
                <div className="expiry-alert-box">
                    <h4>⚠️ Expiry Warning: Items expiring within 30 days</h4>
                    <div className="expiry-grid">
                        {expiringSoon.map(m => (
                            <div key={m.id} className="expiry-item-card">
                                <div className="med-name">{m.name}</div>
                                <div className="med-detail">Expires: {m.expiryDate}</div>
                                <div className="med-detail">Batch: {m.batchNumber || 'N/A'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="table-wrapper-card">
                <h2>Medicine Inventory</h2>
                <div className="table-scroll-area">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th>Category</th>
                                <th>Stock (Qty)</th>
                                <th>Sale Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.length > 0 ? (
                                currentRecords.map((med) => (
                                    <tr key={med.id}>
                                        <td><strong>{med.name}</strong></td>
                                        <td>{med.category}</td>
                                        <td style={{ color: med.quantity < 10 ? '#e74c3c' : '#2ecc71', fontWeight: 'bold' }}>
                                            {med.quantity} {med.quantity < 10 && "(Low)"}
                                        </td>
                                        <td>Rs. {med.salePrice}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No medicines found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="pagination-wrapper">
                        <button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="p-btn">⬅️ Previous</button>
                        <span className="p-text">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-btn">Next ➡️</button>
                    </div>
                )}
            </div>

            {/* 🌟 POORA GLOBAL RESPONSIVE CSS INJECTION FOR DASHBOARD 🌟 */}
            <style>{`
                .dashboard-container { padding: 15px; margin: 0 auto; max-width: 1200px; font-family: 'Segoe UI', system-ui, sans-serif; box-sizing: border-box; }
                .main-title { color: #1a3a5f; margin-bottom: 25px; font-size: calc(1.6rem + 0.6vw); }
                .status-msg { text-align: center; margin-top: 100px; font-family: Arial, sans-serif; }
                .error-msg { color: red; }
                .expiry-alert-box { background: #fff5f5; border: 1px solid #fc8181; color: #c53030; padding: 20px; border-radius: 12px; margin-top: 25px; box-sizing: border-box; }
                .expiry-alert-box h4 { margin: 0 0 15px 0; font-size: 15px; }
                .expiry-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 15px; }
                .expiry-item-card { background: white; padding: 12px; border-radius: 8px; border-left: 5px solid #e53e3e; box-shadow: 0 2px 4px rgba(0,0,0,0.03); box-sizing: border-box; }
                .expiry-item-card .med-name { font-weight: bold; color: #c53030; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .expiry-item-card .med-detail { font-size: 13px; color: #718096; margin-top: 3px; }
                .table-wrapper-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-top: 25px; box-sizing: border-box; }
                .table-wrapper-card h2 { color: #2c3e50; margin: 0 0 20px 0; font-size: calc(1.2rem + 0.3vw); }
                .table-scroll-area { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
                .inventory-table { width: 100%; border-collapse: collapse; min-width: 500px; text-align: left; }
                .inventory-table th { padding: 12px 15px; border-bottom: 2px solid #edf2f7; color: #4a5568; font-size: 14px; background: #f8f9fa; }
                .inventory-table td { padding: 12px 15px; border-bottom: 1px solid #edf2f7; font-size: 14px; }
                .pagination-wrapper { display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 20px; flex-wrap: wrap; }
                .p-btn { background: #5d67f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 13px; }
                .p-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .p-text { font-weight: bold; font-size: 13px; }
                @media (max-width: 768px) {
                    .expiry-grid { grid-template-columns: 1fr; }
                    .pagination-wrapper { justify-content: space-between; width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default DashboardPage;