import React from 'react';

// ({ stats }) ka matlab hai hum ne parent se data receive kiya
const Dashboard = ({ stats }) => {
    // Stats khali hon toh default values set ho jayengi
    const { 
        todayRevenue = 0, 
        lowStockCount = 0, 
        todayBillCount = 0, 
        totalProfit = 0, 
        totalLoss = 0 
    } = stats || {};

    return (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', width: '100%' }}>
            
            {/* 1. TODAY'S REVENUE CARD */}
            <div style={cardStyle('#27ae60')}>
                <p style={labelStyle}>TODAY'S REVENUE</p>
                <h2 style={valueStyle}>Rs. {todayRevenue.toLocaleString()}</h2>
                <small style={smallStyle}>Total Bills: {todayBillCount}</small>
            </div>

            {/* 2. LOW STOCK ALERT CARD */}
            <div style={cardStyle('#e74c3c')}>
                <p style={labelStyle}>LOW STOCK ALERT</p>
                <h2 style={valueStyle}>{lowStockCount} Items</h2>
                <small style={smallStyle}>Needs Reordering</small>
            </div>

            {/* 3. TRANSACTIONS CARD */}
            <div style={cardStyle('#2980b9')}>
                <p style={labelStyle}>TRANSACTIONS</p>
                <h2 style={valueStyle}>{todayBillCount}</h2>
                <small style={smallStyle}>Completed Today</small>
            </div>

            {/* 🟢 4. TOTAL PROFIT CARD (Exact Same Design Theme) */}
            <div style={cardStyle('#2ecc71')}>
                <p style={labelStyle}>TOTAL PROFIT 💰</p>
                <h2 style={{ ...valueStyle, color: '#2ecc71' }}>Rs. {totalProfit.toLocaleString()}</h2>
                <small style={smallStyle}>Net Earnings</small>
            </div>

            {/* 🔴 5. TOTAL LOSS CARD (Exact Same Design Theme) */}
            <div style={cardStyle('#d35400')}>
                <p style={labelStyle}>TOTAL LOSS (EXPIRED) 📉</p>
                <h2 style={{ ...valueStyle, color: '#e74c3c' }}>Rs. {totalLoss.toLocaleString()}</h2>
                <small style={smallStyle}>From Expired Stock</small>
            </div>

        </div>
    );
};

// Styles (Aapke original design ko maintain rakha hai)
const cardStyle = (color) => ({
    flex: '1', 
    minWidth: '220px', 
    backgroundColor: 'white', 
    padding: '25px',
    borderRadius: '12px', 
    boxShadow: '0 8px 16px rgba(0,0,0,0.05)', 
    borderLeft: `8px solid ${color}`
});

const labelStyle = { 
    fontSize: '11px', 
    fontWeight: 'bold', 
    color: '#95a5a6', 
    margin: 0,
    textTransform: 'uppercase'
};

const valueStyle = { 
    fontSize: '28px', 
    color: '#2c3e50', 
    margin: '10px 0',
    fontWeight: 'bold'
};

const smallStyle = {
    color: '#7f8c8d',
    fontSize: '12px'
};

export default Dashboard;