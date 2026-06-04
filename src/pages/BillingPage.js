import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Config } from '../config';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const BillingPage = () => {
    const [medicines, setMedicines] = useState([]); 
    const [cart, setCart] = useState([]); 
    const [total, setTotal] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [lastSavedReceipt, setLastSavedReceipt] = useState(null);

    const STORE_LOGO_URL = "/logo.png";
    const STORE_ADMIN_NUMBER = "03032671855"; 
    const STORE_NAME = "CITI HEALTH CARE";
    const STORE_ADDRESS = "Pilot SS/93 Phase II, Defence View Karachi";

    const fetchInitialData = async () => {
        try {
            const res = await axios.get(`${Config.CORE_API}/medicines/all`);
            if (res.data.message === "SUCCESS!") setMedicines(res.data.data);
        } catch (err) {
            console.error("Error fetching medicines:", err);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const addToCart = (med) => {
        const existing = cart.find(item => item.id === med.id);
        if (existing) {
            // Agar pehle se hai to quantity 1 barha do, par user ise baad mein edit kar sakta hai
            setCart(cart.map(item => 
                item.id === med.id ? { ...item, selectedQty: item.selectedQty + 1 } : item
            ));
        } else {
            setCart([...cart, { ...med, selectedQty: 1 }]);
        }
    };

    const updateQty = (id, newQty) => {
        // Direct type karne ke liye handles empty string taaki user backspace daba sake
        if (newQty === '') {
            setCart(cart.map(item => item.id === id ? { ...item, selectedQty: '' } : item));
            return;
        }
        const qty = parseInt(newQty);
        setCart(cart.map(item => 
            item.id === id ? { ...item, selectedQty: qty >= 0 ? qty : 0 } : item
        ));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    useEffect(() => {
        const t = cart.reduce((acc, item) => {
            const qty = item.selectedQty === '' ? 0 : item.selectedQty;
            return acc + (item.salePrice * qty);
        }, 0);
        setTotal(t);
    }, [cart]);

    const handleCheckout = async () => {
        if (!customerName) {
            alert("Customer ka naam lazmi likhein!");
            return;
        }

        // Check agar koi quantity empty chor di ho
        if (cart.some(item => item.selectedQty === '' || item.selectedQty === 0)) {
            alert("Tamam items ki quantity sahi se likhein!");
            return;
        }

        const billData = {
            customerName: customerName,
            items: cart.map(item => ({
                id: item.id, 
                quantity: item.selectedQty 
            })),
            totalAmount: total
        };

        try {
            const res = await axios.post(`${Config.CORE_API}/receipts/generate`, billData);
            if (res.data.message === "SUCCESS!") {
                alert("Bill Generated!");
                
                const enrichedReceipt = {
                    ...res.data.data,
                    items: res.data.data.items.map(resItem => {
                        const originalMed = cart.find(c => c.id === resItem.id);
                        return {
                            ...resItem,
                            name: originalMed?.name || "Medicine",
                            salePrice: originalMed?.salePrice || 0
                        };
                    })
                };

                setLastSavedReceipt(enrichedReceipt);
                setCart([]);
                setCustomerName('');
                fetchInitialData();
            }
        } catch (err) {
            console.error("Checkout Error:", err.response?.data);
            alert("Error: " + (err.response?.data?.message || "Server Error"));
        }
    };

    const downloadPDF = () => {
        if (!lastSavedReceipt) return;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 150] });
        doc.addImage(STORE_LOGO_URL, 'PNG', 20, 8, 40, 30);
        doc.setFont("courier", "bold"); doc.setFontSize(10);
        doc.text(STORE_NAME, 40, 30, { align: "center" });
        doc.setFont("courier", "normal"); doc.setFontSize(7);
        doc.text(STORE_ADDRESS, 40, 34, { align: "center" });
        doc.setFont("courier", "bold");
        doc.text(`STORE CONTACT: ${STORE_ADMIN_NUMBER}`, 40, 38, { align: "center" });
        doc.setFont("courier", "normal"); doc.setFontSize(7);
        doc.text(`Receipt ID: ${lastSavedReceipt.id}`, 5, 45);
        doc.text(`Customer  : ${lastSavedReceipt.customerName.toUpperCase()}`, 5, 49);
        doc.text(`Date      : ${new Date().toLocaleString()}`, 5, 53);

        const tableColumn = ["Item", "Price", "Qty", "Total"];
        const tableRows = lastSavedReceipt.items.map(item => [
            item.name.substring(0, 15), 
            item.salePrice.toFixed(2),
            item.quantity,
            (item.salePrice * item.quantity).toFixed(2)
        ]);

        autoTable(doc, {
            startY: 57, margin: { left: 4, right: 4 }, head: [tableColumn], body: tableRows,
            theme: 'plain', styles: { font: 'courier', fontSize: 7, padding: 1 },
            headStyles: { fontStyle: 'bold', borderBottom: 1 },
        });

        const finalY = doc.lastAutoTable.finalY;
        doc.setFont("courier", "bold"); doc.setFontSize(8);
        doc.text(`TOTAL AMOUNT: Rs. ${lastSavedReceipt.totalAmount.toFixed(2)}`, 75, finalY + 7, { align: "right" });
        doc.setFont("courier", "italic"); doc.setFontSize(7);
        doc.text("Thank You for Your Visit!", 40, finalY + 14, { align: "center" });

        const safeCustomerName = lastSavedReceipt.customerName.replace(/\s+/g, '_');
        doc.save(`CitiHealth_Invoice_${safeCustomerName}.pdf`);
    };

    return (
        <div className="billing-page-wrapper">
            <div className="no-print billing-flex-container">
                
                {/* Medicine Stock Selector */}
                <div className="medicine-selector-card">
                    <h3>Select Medicines</h3>
                    <div className="medicine-scroll-list">
                        {medicines.map(m => (
                            <div key={m.id} className="med-clickable-row" onClick={() => addToCart(m)}>
                                <span className="med-item-title">{m.name}</span>
                                <b className="med-item-price">Rs. {m.salePrice}</b>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Current Bill Area */}
                <div className="current-bill-card">
                    <h3>Current Bill Counter</h3>
                    <input 
                        type="text"
                        placeholder="Enter Customer Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="customer-input-field"
                    />

                    {/* Desktop View Table */}
                    <div className="desktop-cart-table-view">
                        <table className="billing-cart-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Price</th>
                                    <th style={{ textAlign: 'center' }}>Qty (Edit Available)</th>
                                    <th>Total</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.length > 0 ? (
                                    cart.map(item => (
                                        <tr key={item.id}>
                                            <td style={{ wordBreak: 'break-word' }}><b>{item.name}</b></td>
                                            <td>Rs. {item.salePrice}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <input 
                                                    type="number" 
                                                    value={item.selectedQty} 
                                                    onChange={(e) => updateQty(item.id, e.target.value)} 
                                                    className="cart-qty-input"
                                                    min="0"
                                                />
                                            </td>
                                            <td>Rs. {item.salePrice * (item.selectedQty || 0)}</td>
                                            <td>
                                                <button onClick={() => removeFromCart(item.id)} className="remove-item-x-btn">✕</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', color: '#999', padding: '3px' }}>Cart khali hai.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View Responsive Cards (No Table Scroll Needed!) */}
                    <div className="mobile-cart-cards-view">
                        {cart.length > 0 ? (
                            cart.map(item => (
                                <div key={item.id} className="mobile-cart-item-card">
                                    <div className="mobile-card-header">
                                        <span className="mobile-med-name">{item.name}</span>
                                        <button onClick={() => removeFromCart(item.id)} className="mobile-remove-btn">✕</button>
                                    </div>
                                    <div className="mobile-card-body-grid">
                                        <div className="mobile-meta-info">
                                            <span>Price: Rs. {item.salePrice}</span>
                                            <span className="mobile-item-subtotal">Total: Rs. {item.salePrice * (item.selectedQty || 0)}</span>
                                        </div>
                                        <div className="mobile-qty-input-zone">
                                            <label>Qty:</label>
                                            <input 
                                                type="number" 
                                                value={item.selectedQty} 
                                                onChange={(e) => updateQty(item.id, e.target.value)}
                                                className="mobile-qty-field"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="mobile-empty-msg">Cart khali hai. Medicines select karein.</p>
                        )}
                    </div>

                    <div className="checkout-summary-section">
                        <h2 className="grand-total-heading">Grand Total: Rs. {total}</h2>
                        <button 
                            onClick={handleCheckout} 
                            disabled={cart.length === 0} 
                            className="billing-action-btn checkout-green"
                        >
                            Generate Bill
                        </button>
                        
                        {lastSavedReceipt && (
                            <div className="action-buttons-group">
                                <button onClick={() => window.print()} className="billing-action-btn print-blue">Print Receipt</button>
                                <button onClick={downloadPDF} className="billing-action-btn pdf-orange">Download PDF</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Thermal Slip */}
            {lastSavedReceipt && (
                <div className="print-only thermal-slip-view">
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <img src={STORE_LOGO_URL} alt="Logo" style={{ width: '55px', height: '55px', borderRadius: '50%', border: '1px solid #000', padding: '3px' }} />
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>{STORE_NAME}</h4>
                        <p style={{ margin: '2px 0', fontSize: '0.8rem' }}>{STORE_ADDRESS}</p>
                        <p style={{ margin: '3px 0', fontSize: '0.85rem', fontWeight: 'bold' }}>{STORE_ADMIN_NUMBER}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', margin: '5px 0' }}>
                        <span>REG#1348</span> <span>TRN#8726</span> <span>CSHR#78134</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', margin: '5px 0', textAlign: 'center' }}>{new Date().toLocaleString()}</p>
                    <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>
                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left' }}>
                                <th>Item</th> <th style={{ textAlign: 'center' }}>Qty</th> <th style={{ textAlign: 'right' }}>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lastSavedReceipt.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td style={{ padding: '3px 0' }}>{item.name.toUpperCase()}</td>
                                    <td style={{ textAlign: 'center', padding: '3px 0' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right', padding: '3px 0' }}>Rs. {(item.salePrice * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold' }}>
                        <span>TOTAL:</span> <span>Rs. {lastSavedReceipt.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            )}

            {/* 🌟 ULTRA RESPONSIVE DESIGN STYLES 🌟 */}
            <style>
                {`
                    .billing-page-wrapper { font-family: 'Segoe UI', system-ui, sans-serif; padding: 5px; box-sizing: border-box; }
                    .billing-flex-container { display: flex; gap: 20px; flex-wrap: wrap; width: 100%; }
                    
                    .medicine-selector-card { flex: 1 1 350px; background: #f9f9f9; padding: 20px; border-radius: 12px; box-sizing: border-box; border: 1px solid #e2e8f0; }
                    .medicine-scroll-list { maxHeight: 420px; overflow-Y: auto; padding-right: 5px; }
                    
                    .med-clickable-row { padding: 12px; border-bottom: 1px solid #edf2f7; cursor: pointer; display: flex; justify-content: space-between; alignItems: center; background: #fff; margin-bottom: 6px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
                    .med-item-title { word-break: break-word; margin-right: 10px; color: #2d3748; font-weight: 500; }
                    .med-item-price { white-space: nowrap; color: #2b6cb0; }

                    .current-bill-card { flex: 1.5 1 450px; background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-sizing: border-box; }
                    .customer-input-field { width: 100%; padding: 12px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #cbd5e0; box-sizing: border-box; font-size: 15px; }
                    
                    /* Desktop Table Layout Settings */
                    .desktop-cart-table-view { display: block; width: 100%; overflow-x: auto; margin-bottom: 15px; }
                    .billing-cart-table { width: 100%; border-collapse: collapse; }
                    .billing-cart-table th { padding: 10px; text-align: left; border-bottom: 2px solid #edf2f7; color: #4a5568; font-size: 14px; }
                    .billing-cart-table td { padding: 10px; border-bottom: 1px solid #edf2f7; font-size: 14px; }
                    .cart-qty-input { width: 65px; padding: 6px; text-align: center; border: 1px solid #cbd5e0; border-radius: 6px; font-weight: bold; }
                    .remove-item-x-btn { background: #fff5f5; color: #e53e3e; border: 1px solid #fed7d7; border-radius: 50%; width: 26px; height: 26px; cursor: pointer; font-size: 12px; font-weight: bold; display: flex; align-items: center; justify-content: center; }
                    .remove-item-x-btn:hover { background: #e53e3e; color: white; }

                    /* Mobile Card Layout (Hidden by default on Desktop) */
                    .mobile-cart-cards-view { display: none; }

                    .checkout-summary-section { text-align: right; marginTop: 20px; }
                    .grand-total-heading { font-size: calc(1.3rem + 0.5vw); color: #1a202c; margin-bottom: 15px; }
                    
                    .billing-action-btn { padding: 12px 24px; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; }
                    .checkout-green { background-color: #27ae60; }
                    
                    .action-buttons-group { margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap; }
                    .print-blue { background-color: #3498db; }
                    .pdf-orange { background-color: #e67e22; }
                    .thermal-slip-view { padding: 10px; width: 300px; margin: 0 auto; fontFamily: 'Courier New'; color: #000; }

                    /* 📱 HARDCORE MOBILE RESPONSIVE QUERIES (768px and under) */
                    @media (max-width: 768px) {
                        .billing-flex-container { flex-direction: column; gap: 15px; }
                        .medicine-selector-card, .current-bill-card { padding: 15px; }
                        .medicine-scroll-list { maxHeight: 220px; }
                        
                        /* Hide Desktop Table and Show Mobile Grid Cards */
                        .desktop-cart-table-view { display: none; }
                        .mobile-cart-cards-view { display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; }
                        
                        /* Gorgeous Mobile Cart Item Design */
                        .mobile-cart-item-card { background: #f7fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 10px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.01); }
                        .mobile-card-header { display: flex; justify-content: space-between; align-items: center; }
                        .mobile-med-name { font-weight: bold; color: #2d3748; font-size: 15px; }
                        .mobile-remove-btn { background: transparent; border: none; color: #a0aec0; font-size: 18px; cursor: pointer; padding: 0 5px; }
                        
                        .mobile-card-body-grid { display: flex; justify-content: space-between; align-items: center; }
                        .mobile-meta-info { display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: #718096; }
                        .mobile-item-subtotal { font-weight: 600; color: #2b6cb0; font-size: 14px; }
                        
                        /* Mobile Quantity Editable Field Input Control Zone */
                        .mobile-qty-input-zone { display: flex; align-items: center; gap: 6px; }
                        .mobile-qty-input-zone label { font-size: 13px; font-weight: bold; color: #4a5568; }
                        .mobile-qty-field { width: 65px; padding: 8px; text-align: center; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 15px; font-weight: bold; background: white; color: #1a202c; -webkit-appearance: none; }
                        
                        .mobile-empty-msg { text-align: center; color: #a0aec0; font-size: 14px; padding: 15px 0; }
                        .checkout-summary-section { text-align: left; }
                        .billing-action-btn { width: 100% !important; margin-bottom: 8px; display: block; text-align: center; box-sizing: border-box; }
                        .action-buttons-group { width: 100%; flex-direction: column; gap: 0; }
                    }

                    @media print {
                        .no-print { display: none !important; }
                        .print-only { display: block !important; }
                    }
                `}
            </style>
        </div>
    );
};

export default BillingPage;