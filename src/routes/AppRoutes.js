import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import InventoryPage from '../pages/InventoryPage';
import BillingPage from '../pages/BillingPage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<DashboardPage />} />
            {/* Future pages: */}
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/bill" element={<BillingPage />} />
        </Routes>
    );
};

export default AppRoutes;