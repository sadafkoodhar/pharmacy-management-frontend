// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Config } from './config';

// function App() {
//   // Backend se milne wale stats ke liye state
//   const [dashboard, setDashboard] = useState({ 
//     todayRevenue: 0, 
//     lowStockCount: 0, 
//     todayBillCount: 0 
//   });
  
//   const [medicines, 1] = useState([]); 
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

// useEffect(() => {
//     const loadData = async () => {
//       try {
//         setError(null);
//         const [dashRes, medRes] = await Promise.all([
//           axios.get(`${Config.CORE_API}/reports/dashboard`),
//           axios.get(`${Config.CORE_API}/medicines/all`)
//         ]);

//         // Dashboard Mapping Update
//         // Aapke screenshot ke mutabiq: dashRes.data.data contains the stats
//         if (dashRes.data.message === "SUCCESS!") {
//           setDashboard(dashRes.data.data);
//         }

//         // Medicines List Mapping Update
//         if (medRes.data.message === "SUCCESS!") {
//           setMedicines(medRes.data.data);
//         }
        
//       } catch (error) {
//         console.error("API Error:", error);
//         setError("Connection error!");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
// }, []);
//   if (loading) return <h2 style={statusMessageStyle}>Loading Pharmacy System...</h2>;
//   if (error) return <h2 style={{...statusMessageStyle, color: 'red'}}>{error}</h2>;

//   return (
//     <div style={{ padding: '30px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
//       <h1 style={{ color: '#1a3a5f', marginBottom: '30px' }}>Pharmacy Management System</h1>

//       {/* --- Dashboard Cards Section --- */}
//       <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
//         <div style={cardStyle('#27ae60')}>
//           <h3 style={cardTitleStyle}>Today's Revenue</h3>
//           <p style={cardValueStyle}>Rs. {dashboard.todayRevenue.toLocaleString()}</p>
//           <small>Total Bills: {dashboard.todayBillCount}</small>
//         </div>

//         <div style={cardStyle('#e74c3c')}>
//           <h3 style={cardTitleStyle}>Low Stock Alert</h3>
//           <p style={cardValueStyle}>{dashboard.lowStockCount} Items</p>
//           <small>Needs Reordering</small>
//         </div>
//       </div>

//       {/* --- Medicine Inventory Table Section --- */}
//       <div style={tableContainerStyle}>
//         <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Medicine Inventory</h2>
//         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//           <thead>
//             <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
//               <th style={tableHeaderStyle}>Medicine Name</th>
//               <th style={tableHeaderStyle}>Category</th>
//               <th style={tableHeaderStyle}>Stock (Qty)</th>
//               <th style={tableHeaderStyle}>Sale Price</th>
//             </tr>
//           </thead>
//           <tbody>
//             {medicines.length > 0 ? (
//               medicines.map((med) => (
//                 <tr key={med.id} style={tableRowStyle}>
//                   <td style={tableCellStyle}><strong>{med.name}</strong></td>
//                   <td style={tableCellStyle}>{med.category}</td>
//                   <td style={{ 
//                     ...tableCellStyle, 
//                     color: med.quantity < 10 ? '#e74c3c' : '#2ecc71', 
//                     fontWeight: 'bold' 
//                   }}>
//                     {med.quantity} {med.quantity < 10 && "(Low)"}
//                   </td>
//                   <td style={tableCellStyle}>Rs. {med.salePrice}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No medicines found in database.</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// // --- Professional UI Styles ---
// const cardStyle = (color) => ({
//   flex: 1,
//   padding: '25px',
//   backgroundColor: 'white',
//   borderRadius: '12px',
//   borderTop: `6px solid ${color}`,
//   boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
//   transition: 'transform 0.3s'
// });

// const cardTitleStyle = { margin: 0, fontSize: '16px', color: '#7f8c8d', textTransform: 'uppercase' };
// const cardValueStyle = { margin: '10px 0', fontSize: '28px', fontWeight: 'bold', color: '#2c3e50' };

// const tableContainerStyle = { 
//   backgroundColor: 'white', 
//   padding: '25px', 
//   borderRadius: '12px', 
//   boxShadow: '0 10px 20px rgba(0,0,0,0.05)' 
// };

// const tableHeaderStyle = { padding: '15px', borderBottom: '2px solid #edf2f7', color: '#4a5568' };
// const tableCellStyle = { padding: '15px', borderBottom: '1px solid #edf2f7' };
// const tableRowStyle = { transition: 'background 0.2s' };
// const statusMessageStyle = { textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' };

// export default App;

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Sidebar from './components/Sidebar'; // Sidebar ko component bana lein

function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '20px' }}>
          <AppRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;