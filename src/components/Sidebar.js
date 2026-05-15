import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => (
  <div style={{ width: '200px', background: '#2c3e50', color: 'white', height: '100vh', padding: '20px' }}>
    <Link to="/" style={{ color: 'white', display: 'block', marginBottom: '10px' }}>Dashboard</Link>
    <Link to="/inventory" style={{ color: 'white', display: 'block' }}>Inventory</Link>
    <Link to="/bill"style={{color: 'white',display: 'block'}}>Billing System</Link>
  </div>
);

export default Sidebar;