import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Config } from '../config';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'; // Naya import style

const BillingPage = () => {
    const [medicines, setMedicines] = useState([]); 
    const [cart, setCart] = useState([]); 
    const [total, setTotal] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [lastSavedReceipt, setLastSavedReceipt] = useState(null);

    // Initial Data Fetch
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

    // Cart Logic
    const addToCart = (med) => {
        const existing = cart.find(item => item.id === med.id);
        if (existing) {
            alert("Dawa pehle hi add hai!");
            return;
        }
        setCart([...cart, { ...med, selectedQty: 1 }]);
    };

    const updateQty = (id, newQty) => {
        const updatedCart = cart.map(item => 
            item.id === id ? { ...item, selectedQty: parseInt(newQty) || 1 } : item
        );
        setCart(updatedCart);
    };

    useEffect(() => {
        const t = cart.reduce((acc, item) => acc + (item.salePrice * item.selectedQty), 0);
        setTotal(t);
    }, [cart]);

    // --- 1. Generate Bill ---
    const handleCheckout = async () => {
        if (!customerName) {
            alert("Customer ka naam lazmi likhein!");
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
            // URL check: Ensure single /api path
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

    // --- 2. Fixed PDF Download Logic ---
    const downloadPDF = () => {
        if (!lastSavedReceipt) return;
        
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(18);
        doc.text("PHARMACY RECEIPT", 70, 15);
        
        doc.setFontSize(12);
        doc.text(`Receipt ID: ${lastSavedReceipt.id}`, 20, 30);
        doc.text(`Customer: ${lastSavedReceipt.customerName}`, 20, 40);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);

        // Table Content
        const tableColumn = ["Item", "Price", "Qty", "Subtotal"];
        const tableRows = lastSavedReceipt.items.map(item => [
            item.name,
            item.salePrice,
            item.quantity,
            (item.salePrice * item.quantity).toFixed(2)
        ]);

        // Using autoTable as a standalone function
        autoTable(doc, {
            startY: 60,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }
        });

        const finalY = doc.lastAutoTable.finalY;
        doc.setFontSize(14);
        doc.text(`Total Bill: Rs. ${lastSavedReceipt.totalAmount}`, 140, finalY + 15);
        
        doc.save(`Receipt_${lastSavedReceipt.id}.pdf`);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <div className="no-print" style={{ display: 'flex', gap: '30px' }}>
                {/* Left: Search/Select */}
                <div style={{ flex: 1, background: '#f9f9f9', padding: '20px', borderRadius: '12px' }}>
                    <h3>Select Medicines</h3>
                    <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                        {medicines.map(m => (
                            <div key={m.id} style={medItemStyle} onClick={() => addToCart(m)}>
                                <span>{m.name}</span>
                                <b>Rs. {m.salePrice}</b>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Cart & Actions */}
                <div style={{ flex: 1.5, background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #ddd' }}>
                    <h3>Current Bill</h3>
                    <input 
                        type="text"
                        placeholder="Enter Customer Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        style={inputStyle}
                    />

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '10px' }}>Item</th>
                                <th style={{ padding: '10px' }}>Price</th>
                                <th style={{ padding: '10px' }}>Qty</th>
                                <th style={{ padding: '10px' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{item.name}</td>
                                    <td style={{ padding: '10px' }}>{item.salePrice}</td>
                                    <td style={{ padding: '10px' }}>
                                        <input type="number" value={item.selectedQty} min="1" onChange={(e) => updateQty(item.id, e.target.value)} style={{ width: '45px' }} />
                                    </td>
                                    <td style={{ padding: '10px' }}>{item.salePrice * item.selectedQty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ textAlign: 'right', marginTop: '20px' }}>
                        <h2>Grand Total: Rs. {total}</h2>
                        <button onClick={handleCheckout} disabled={cart.length === 0} style={btnStyle('#27ae60')}>Generate Bill</button>
                        
                        {lastSavedReceipt && (
                            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => window.print()} style={btnStyle('#3498db')}>Print Receipt</button>
                                <button onClick={downloadPDF} style={btnStyle('#e67e22')}>Download PDF</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Hidden Receipt for Browser Print --- */}
            {lastSavedReceipt && (
                <div className="print-only" style={{ display: 'none', padding: '30px' }}>
                    <h2 style={{ textAlign: 'center' }}>PHARMACY RECEIPT</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
                        <div>
                            <p><b>Receipt ID:</b> {lastSavedReceipt.id}</p>
                            <p><b>Customer:</b> {lastSavedReceipt.customerName}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p><b>Date:</b> {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #000' }}>
                                <th style={{ textAlign: 'left' }}>Item</th>
                                <th style={{ textAlign: 'center' }}>Qty</th>
                                <th style={{ textAlign: 'right' }}>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lastSavedReceipt.items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right' }}>{item.salePrice * item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <hr />
                    <h3 style={{ textAlign: 'right' }}>Total: Rs. {lastSavedReceipt.totalAmount}</h3>
                </div>
            )}

            <style>
                {`
                    @media print {
                        .no-print { display: none !important; }
                        .print-only { display: block !important; }
                    }
                `}
            </style>
        </div>
    );
};

// Styles
const medItemStyle = { padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', background: '#fff', marginBottom: '5px', borderRadius: '5px' };
const inputStyle = { width: '95%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' };
const btnStyle = (color) => ({ padding: '10px 20px', backgroundColor: color, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' });

export default BillingPage;