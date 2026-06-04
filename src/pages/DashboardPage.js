import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Config } from '../config';
import Dashboard from '../components/Dashboard';

const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState({ 
        todayRevenue: 0, 
        lowStockCount: 0, 
        todayBillCount: 0 ,
        totalProfit: 0,
        totalLoss: 0
    });
    const [medicines, setMedicines] = useState([]); 
    const [expiringSoon, setExpiringSoon] = useState([]); // Expiry state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🌟 Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);

    useEffect(() => {
        const loadAllData = async () => {
            try {
                setError(null);
                // Teeno APIs ko ek sath call kar rahe hain
                const [dashRes, medRes, expiryRes] = await Promise.all([
                    axios.get(`${Config.CORE_API}/reports/dashboard`),
                    axios.get(`${Config.CORE_API}/medicines/all`),
                    axios.get(`${Config.CORE_API}/medicines/expiringSoon`) 
                ]);

                if (dashRes.data.message === "SUCCESS!") {
                    setDashboardData(dashRes.data.data);
                }

                if (medRes.data.message === "SUCCESS!") {
                    setMedicines(medRes.data.data);
                }

                if (expiryRes.data.message === "SUCCESS!") {
                    setExpiringSoon(expiryRes.data.data);
                }
            } catch (err) {
                console.error("Dashboard API Error:", err);
                setError("Backend se connection nahi ho saka.");
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, []);

    if (loading) return <h2 style={statusMessageStyle}>Loading Pharmacy System...</h2>;
    if (error) return <h2 style={{...statusMessageStyle, color: 'red'}}>{error}</h2>;

    // --- PAGINATION LOGIC ---
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
        <div style={{ padding: '15px', margin: '0 auto', maxWidth: '1200px', boxSizing: 'border-box' }}>
            <h1 style={{ color: '#1a3a5f', marginBottom: '25px', fontSize: 'calc(1.6rem + 0.6vw)' }}>
                Pharmacy Management System
            </h1>

            {/* Dashboard Cards Section */}
            <Dashboard stats={dashboardData} />

            {/* --- EXPIRY ALERT SECTION --- */}
            {expiringSoon.length > 0 && (
                <div style={expiryAlertStyle}>
                    <h4 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px' }}>
                        <span>⚠️</span> Expiry Warning: Items expiring within 30 days
                    </h4>
                    {/* 🌟 MODIFIED: Responsive CSS Grid structure */}
                    <div className="expiry-responsive-grid">
                        {expiringSoon.map(m => (
                            <div key={m.id} style={expiryItemStyle}>
                                <div style={{ fontWeight: 'bold', color: '#c53030', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{m.name}</div>
                                <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '4px' }}>Expires: {m.expiryDate}</div>
                                <div style={{ fontSize: '0.85rem', color: '#718096' }}>Batch: {m.batchNumber || 'N/A'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Medicine Inventory Table Section */}
            <div style={tableContainerStyle}>
                <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: 'calc(1.2rem + 0.3vw)' }}>Medicine Inventory</h2>
                
                {/* 🌟 MODIFIED: Wrapped table with responsive horizontal scroll container */}
                <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '550px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                                <th style={tableHeaderStyle}>Medicine Name</th>
                                <th style={tableHeaderStyle}>Category</th>
                                <th style={tableHeaderStyle}>Stock (Qty)</th>
                                <th style={tableHeaderStyle}>Sale Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.length > 0 ? (
                                currentRecords.map((med) => (
                                    <tr key={med.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                        <td style={tableCellStyle}><strong>{med.name}</strong></td>
                                        <td style={tableCellStyle}>{med.category}</td>
                                        <td style={{ 
                                            ...tableCellStyle, 
                                            color: med.quantity < 10 ? '#e74c3c' : '#2ecc71', 
                                            fontWeight: 'bold' 
                                        }}>
                                            {med.quantity} {med.quantity < 10 && "(Low)"}
                                        </td>
                                        <td style={tableCellStyle}>Rs. {med.salePrice}</td>
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
                        
                        <span style={{ fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
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

            {/* 🌟 Global Media Queries Component Specific */}
            <style>
                {`
                    .expiry-responsive-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                        gap: 15px;
                    }
                    @media (max-width: 768px) {
                        .expiry-responsive-grid {
                            grid-template-columns: 1fr; /* Mobile screens par 1 item per row */
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

// --- Styles ---
const tableContainerStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.04)', marginTop: '25px', boxSizing: 'border-box' };
const tableHeaderStyle = { padding: '12px 15px', borderBottom: '2px solid #edf2f7', color: '#4a5568', fontSize: '14px' };
const tableCellStyle = { padding: '12px 15px', fontSize: '14px' };
const statusMessageStyle = { textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' };

const expiryAlertStyle = { 
    backgroundColor: '#fff5f5', 
    border: '1px solid #fc8181', 
    color: '#c53030', 
    padding: '15px', 
    borderRadius: '12px', 
    marginTop: '25px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.03)',
    boxSizing: 'border-box'
};

const expiryItemStyle = {
    background: 'white',
    padding: '12px',
    borderRadius: '8px',
    borderLeft: '5px solid #e53e3e',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
    boxSizing: 'border-box'
};

const paginationContainerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' };
const paginationBtnStyle = { background: '#5d67f6', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px' };

export default DashboardPage;