import React, { useState } from 'react';
import DashboardPage from './DashboardPage'; 
import BillingPage from './BillingPage';     
import InventoryPage from './InventoryPage'; 

const MainAppLayout = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const navigationItems = [
        { id: 'dashboard', label: 'Overview Dashboard', icon: '📊', desc: 'Stats & Alerts' },
        { id: 'inventory', label: 'Medicine Inventory', icon: '📦', desc: 'Stock Manage' },
        { id: 'billing', label: 'Billing Counter', icon: '🧾', desc: 'Invoicing & PDF' }
    ];

    return (
        <div className="app-main-layout">
            
            {/* --- RESPONSIVE NAVIGATION BAR --- */}
            <div className="responsive-nav-container">
                {navigationItems.map((item, index) => {
                    const isActive = activeTab === item.id;
                    
                    return (
                        <div key={item.id} className="nav-item-wrapper">
                            {/* Individual Navigation Card */}
                            <div 
                                onClick={() => setActiveTab(item.id)}
                                className={`nav-tab-card ${isActive ? 'active-tab' : ''}`}
                            >
                                <span className={`nav-icon-badge ${isActive ? 'active-icon' : ''}`}>
                                    {item.icon}
                                </span>
                                <div className="nav-text-block">
                                    <div className="nav-label-text">
                                        {item.label}
                                    </div>
                                    <div className="nav-desc-text">
                                        {item.desc}
                                    </div>
                                </div>
                            </div>

                            {/* Chevron Arrow - Will automatically hide on mobile via CSS */}
                            {index < navigationItems.length - 1 && (
                                <div className="nav-chevron-arrow">
                                    ➔
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* --- DYNAMIC CONTENT AREA --- */}
            <div className="dynamic-content-area">
                {activeTab === 'dashboard' && <DashboardPage />}
                {activeTab === 'inventory' && <InventoryPage />}
                {activeTab === 'billing' && <BillingPage />}
            </div>

            {/* 🌟 SMART SCOPED RESPONSIVE CSS INJECTION 🌟 */}
            <style>{`
                .app-main-layout {
                    padding: 30px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f7fafc;
                    min-height: 100vh;
                    box-sizing: border-box;
                }
                .responsive-nav-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background-color: #edf2f7;
                    padding: 10px;
                    border-radius: 16px;
                    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
                }
                .nav-item-wrapper {
                    display: flex;
                    align-items: center;
                    flex: 1;
                }
                .nav-tab-card {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 12px 20px;
                    border-radius: 12px;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.2s ease-in-out;
                    border: 1px solid transparent;
                    background-color: transparent;
                }
                .nav-tab-card:hover {
                    background-color: rgba(255, 255, 255, 0.4);
                }
                .active-tab {
                    background-color: #ffffff !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                }
                .nav-icon-badge {
                    font-size: 24px;
                    background-color: #edf2f7;
                    padding: 10px;
                    border-radius: 10px;
                    color: #4a5568;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .active-icon {
                    background-color: #ebf8ff !important;
                    color: #3182ce !important;
                }
                .nav-text-block {
                    text-align: left;
                }
                .nav-label-text {
                    font-weight: bold;
                    color: #4a5568;
                    font-size: 0.95rem;
                }
                .active-tab .nav-label-text {
                    color: #3182ce;
                }
                .nav-desc-text {
                    font-size: 0.75rem;
                    color: #a0aec0;
                    margin-top: 2px;
                }
                .nav-chevron-arrow {
                    font-size: 20px;
                    color: #cbd5e0;
                    padding: 0 15px;
                    font-weight: bold;
                }
                .dynamic-content-area {
                    margin-top: 25px;
                }

                /* 📱 MOBILE SCREEN OPTIMIZATIONS (Max Width: 900px) */
                @media (max-width: 900px) {
                    .app-main-layout {
                        padding: 15px; /* Margins mobile ke mutabiq kam kar diye */
                    }
                    .responsive-nav-container {
                        flex-direction: column; /* Rows ko stack kar diya vertical */
                        background-color: transparent;
                        box-shadow: none;
                        padding: 0;
                        gap: 10px;
                    }
                    .nav-item-wrapper {
                        width: 100%; /* Har tab card mobile par full width lega */
                    }
                    .nav-tab-card {
                        background-color: #edf2f7; /* Unselected tabs ko block look diya */
                        padding: 10px 15px;
                    }
                    .nav-chevron-arrow {
                        display: none; /* Mobile par layout kharab karne wale teer hataye */
                    }
                    .nav-icon-badge {
                        font-size: 20px;
                        padding: 8px;
                    }
                    .nav-label-text {
                        font-size: 0.9rem;
                    }
                    .nav-desc-text {
                        display: none; /* Space bachane ke liye small description hide kar di */
                    }
                }
            `}</style>
        </div>
    );
};

export default MainAppLayout;