import React from 'react';

// ({ stats }) ka matlab hai hum ne parent se data receive kiya
const Dashboard = ({ stats }) => {
    // Agar stats khali hain toh default 0 rakho
    const { todayRevenue = 0, lowStockCount = 0, todayBillCount = 0 } = stats || {};

    return (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={cardStyle('#27ae60')}>
                <p style={labelStyle}>TODAY'S REVENUE</p>
                <h2 style={valueStyle}>Rs. {todayRevenue.toLocaleString()}</h2>
                <small>Total Bills: {todayBillCount}</small>
            </div>

            <div style={cardStyle('#e74c3c')}>
                <p style={labelStyle}>LOW STOCK ALERT</p>
                <h2 style={valueStyle}>{lowStockCount} Items</h2>
                <small>Needs Reordering</small>
            </div>

            <div style={cardStyle('#2980b9')}>
                <p style={labelStyle}>TRANSACTIONS</p>
                <h2 style={valueStyle}>{todayBillCount}</h2>
                <small>Completed Today</small>
            </div>
        </div>
    );
};

// Styles (same as before)
const cardStyle = (color) => ({
    flex: '1', minWidth: '200px', backgroundColor: 'white', padding: '25px',
    borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)', borderLeft: `8px solid ${color}`
});
const labelStyle = { fontSize: '12px', fontWeight: 'bold', color: '#95a5a6', margin: 0 };
const valueStyle = { fontSize: '28px', color: '#2c3e50', margin: '10px 0' };

export default Dashboard;