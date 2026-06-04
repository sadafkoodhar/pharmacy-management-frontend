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

    // 🔥 STATIC/DYNAMIC CONFIG FOR LOGO AND ADMIN NUMBER
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
            const updatedCart = cart.map(item => 
                item.id === med.id ? { ...item, selectedQty: item.selectedQty + 1 } : item
            );
            setCart(updatedCart);
        } else {
            setCart([...cart, { ...med, selectedQty: 1 }]);
        }
    };

    const updateQty = (id, newQty) => {
        const qty = parseInt(newQty);
        const updatedCart = cart.map(item => 
            item.id === id ? { ...item, selectedQty: qty > 0 ? qty : 1 } : item
        );
        setCart(updatedCart);
    };

    useEffect(() => {
        const t = cart.reduce((acc, item) => acc + (item.salePrice * item.selectedQty), 0);
        setTotal(t);
    }, [cart]);

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
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 150] 
        });
        
        doc.addImage(STORE_LOGO_URL, 'PNG', 20, 8, 40, 30);
        
        doc.setFont("courier", "bold");
        doc.setFontSize(10);
        doc.text(STORE_NAME, 40, 30, { align: "center" });
        
        doc.setFont("courier", "normal");
        doc.setFontSize(7);
        doc.text(STORE_ADDRESS, 40, 34, { align: "center" });
        
        doc.setFont("courier", "bold");
        doc.text(`STORE CONTACT: ${STORE_ADMIN_NUMBER}`, 40, 38, { align: "center" });
        
        doc.setFont("courier", "normal");
        doc.setFontSize(7);
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
            startY: 57,
            margin: { left: 4, right: 4 },
            head: [tableColumn],
            body: tableRows,
            theme: 'plain', 
            styles: { font: 'courier', fontSize: 7, padding: 1 },
            headStyles: { fontStyle: 'bold', borderBottom: 1 },
        });

        const finalY = doc.lastAutoTable.finalY;
        doc.setFont("courier", "bold");
        doc.setFontSize(8);
        doc.text(`TOTAL AMOUNT: Rs. ${lastSavedReceipt.totalAmount.toFixed(2)}`, 75, finalY + 7, { align: "right" });
        
        doc.setFont("courier", "italic");
        doc.setFontSize(7);
        doc.text("Thank You for Your Visit!", 40, finalY + 14, { align: "center" });

        const safeCustomerName = lastSavedReceipt.customerName.replace(/\s+/g, '_');
        doc.save(`CitiHealth_Invoice_${safeCustomerName}.pdf`);
    };

    return (
        <div style={{ padding: '15px', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}>
            {/* 🌟 MODIFIED: Container styles flex-wrap aur padding handles responsive shifting */}
            <div className="no-print billing-flex-container">
                
                {/* Medicine Stock Selector Container */}
                <div style={{ flex: '1 1 350px', background: '#f9f9f9', padding: '20px', borderRadius: '12px', boxSizing: 'border-box' }}>
                    <h3>Select Medicines</h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                        {medicines.map(m => (
                            <div key={m.id} style={medItemStyle} onClick={() => addToCart(m)}>
                                <span style={{ wordBreak: 'break-word', marginRight: '10px' }}>{m.name}</span>
                                <b style={{ whiteSpace: 'nowrap' }}>Rs. {m.salePrice}</b>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Checkout Processing Billing View Container */}
                <div style={{ flex: '1.5 1 450px', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #ddd', boxSizing: 'border-box' }}>
                    <h3>Current Bill</h3>
                    <input 
                        type="text"
                        placeholder="Enter Customer Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        style={inputStyle}
                    />

                    {/* 🌟 MODIFIED: Added responsive wrapper table overflow check */}
                    <div style={{ width: '100%', overflowX: 'auto', marginBottom: '15px', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
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
                                        <td style={{ padding: '10px', wordBreak: 'break-word' }}>{item.name}</td>
                                        <td style={{ padding: '10px' }}>{item.salePrice}</td>
                                        <td style={{ padding: '10px' }}>
                                            <input type="number" value={item.selectedQty} min="1" onChange={(e) => updateQty(item.id, e.target.value)} style={{ width: '50px', padding: '4px', textAlign: 'center' }} />
                                        </td>
                                        <td style={{ padding: '10px' }}>{item.salePrice * item.selectedQty}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '20px' }}>
                        <h2 style={{ fontSize: 'calc(1.3rem + 0.5vw)' }}>Grand Total: Rs. {total}</h2>
                        <button onClick={handleCheckout} disabled={cart.length === 0} style={btnStyle('#27ae60')}>Generate Bill</button>
                        
                        {lastSavedReceipt && (
                            <div className="action-buttons-group">
                                <button onClick={() => window.print()} style={btnStyle('#3498db')}>Print Receipt</button>
                                <button onClick={downloadPDF} style={btnStyle('#e67e22')}>Download PDF</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 🖨️ Thermal Slip View Layout */}
            {lastSavedReceipt && (
                <div className="print-only" style={{ display: 'none', padding: '10px', width: '300px', margin: '0 auto', fontFamily: '"Courier New", Courier, monospace', color: '#000' }}>
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <img src={STORE_LOGO_URL} alt="Logo" style={{ width: '55px', height: '55px', borderRadius: '50%', border: '1px solid #000', padding: '3px' }} />
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>{STORE_NAME}</h4>
                        <p style={{ margin: '2px 0', fontSize: '0.8rem' }}>{STORE_ADDRESS}</p>
                        <p style={{ margin: '3px 0', fontSize: '0.85rem', fontWeight: 'bold' }}>{STORE_ADMIN_NUMBER}</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', margin: '5px 0' }}>
                        <span>REG#1348</span>
                        <span>TRN#8726</span>
                        <span>CSHR#78134</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', margin: '2px 0' }}>HELPED BY: SYSTEM ADMIN</p>
                    <p style={{ fontSize: '0.75rem', margin: '5px 0', textAlign: 'center' }}>{new Date().toLocaleString()}</p>
                    
                    <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left' }}>
                                <th style={{ paddingBottom: '5px' }}>Item</th>
                                <th style={{ textAlign: 'center', paddingBottom: '5px' }}>Qty</th>
                                <th style={{ textAlign: 'right', paddingBottom: '5px' }}>Subtotal</th>
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
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', margin: '5px 0' }}>
                        <span>ITEM COUNT:</span>
                        <span>{lastSavedReceipt.items.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold', marginTop: '5px' }}>
                        <span>TOTAL:</span>
                        <span>Rs. {lastSavedReceipt.totalAmount.toFixed(2)}</span>
                    </div>

                    <div style={{ borderTop: '1px dashed #000', margin: '15px 0 5px 0' }}></div>
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', fontStyle: 'italic', margin: '5px 0' }}>Thank You For Your Visit!</p>
                </div>
            )}

            {/* 🌟 Custom Global CSS Media Injection for layout adjustments */}
            <style>
                {`
                    .billing-flex-container {
                        display: flex;
                        gap: 25px;
                        flex-wrap: wrap;
                        width: 100%;
                    }
                    .action-buttons-group {
                        margin-top: 15px;
                        display: flex;
                        gap: 10px;
                        justify-content: flex-end;
                        flex-wrap: wrap;
                    }
                    @media (max-width: 768px) {
                        .billing-flex-container {
                            flex-direction: column;
                            gap: 20px;
                        }
                        .action-buttons-group, .action-buttons-group button {
                            width: 100%;
                        }
                        button {
                            width: 100%;
                            margin-bottom: 5px;
                        }
                    }
                    @media print {
                        .no-print { display: none !important; }
                        .print-only { display: block !important; }
                        body { background: white; color: black; }
                    }
                `}
            </style>
        </div>
    );
};

const medItemStyle = { padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', marginBottom: '6px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' };
const btnStyle = (color) => ({ padding: '12px 20px', backgroundColor: color, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', minWidth: '120px' });

export default BillingPage;