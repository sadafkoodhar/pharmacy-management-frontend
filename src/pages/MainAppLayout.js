import React, { useState } from 'react';
import DashboardPage from './DashboardPage'; 
import BillingPage from './BillingPage';     
import InventoryPage from './InventoryPage'; // Sahi import hai

const MainAppLayout = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const navigationItems = [
        { id: 'dashboard', label: 'Overview Dashboard', icon: '📊', desc: 'System Stats & Expiry Alerts' },
        { id: 'inventory', label: 'Medicine Inventory', icon: '📦', desc: 'Stock Management' },
        { id: 'billing', label: 'Billing Counter', icon: '🧾', desc: 'Invoicing & PDF Receipts' }
    ];

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f7fafc', minHeight: '100vh' }}>
            
            {/* --- NEW BREADCRUMB STYLE TOP NAV BAR --- */}
            <div style={navContainerStyle}>
                {navigationItems.map((item, index) => {
                    const isActive = activeTab === item.id;
                    
                    return (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            {/* Individual Breadcrumb Card */}
                            <div 
                                onClick={() => setActiveTab(item.id)}
                                style={{
                                    ...tabStyle,
                                    backgroundColor: isActive ? '#fff' : 'transparent',
                                    boxShadow: isActive ? '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none',
                                    border: isActive ? '1px solid #e2e8f0' : '1px solid transparent',
                                }}
                            >
                                <span style={{ 
                                    fontSize: '24px', 
                                    backgroundColor: isActive ? '#ebf8ff' : '#edf2f7',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    color: isActive ? '#3182ce' : '#4a5568'
                                }}>
                                    {item.icon}
                                </span>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: 'bold', color: isActive ? '#2b6cb0' : '#4a5568', fontSize: '1rem' }}>
                                        {item.label}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '2px' }}>
                                        {item.desc}
                                    </div>
                                </div>
                            </div>

                            {/* Chevron Arrow */}
                            {index < navigationItems.length - 1 && (
                                <div style={{ fontSize: '20px', color: '#cbd5e0', padding: '0 15px', fontWeight: 'bold' }}>
                                    ➔
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* --- DYNAMIC CONTENT AREA (FIXED) --- */}
            <div style={{ marginTop: '30px' }}>
                {activeTab === 'dashboard' && <DashboardPage />}
                
                {/* Yahan pehle dummy div tha, ab aapka asli page load hoga */}
                {activeTab === 'inventory' && <InventoryPage />}
                
                {activeTab === 'billing' && <BillingPage />}
            </div>
        </div>
    );
};

// --- Styles ---
const navContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#edf2f7',
    padding: '10px',
    borderRadius: '16px',
    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
};

const tabStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '12px 20px',
    borderRadius: '12px',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s ease-in-out',
};

export default MainAppLayout;