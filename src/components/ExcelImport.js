import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { Config } from '../config';

const ExcelImport = ({ onImportSuccess }) => {

    const parseToDatabaseDate = (rawDate) => {
    if (!rawDate) return null;

    // 1. Agar Excel ne ise already JavaScript Date Object bana diya hai
    if (rawDate instanceof Date && !isNaN(rawDate)) {
        return rawDate.toISOString().split('T')[0];
    }

    let dateStr = String(rawDate).trim();

    // 2. Agar date string hai, toh check karein format kya hai
    // Case A: Agar slash format hai (e.g., 31/05/2026 ya 05/31/2026)
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        // Agar saal (Year) akhiri mein 4 digits ka hai (DD/MM/YYYY)
        if (parts[2] && parts[2].length === 4) {
            let day = parts[0].padStart(2, '0');
            let month = parts[1].padStart(2, '0');
            let year = parts[2];
            
            // Choti si validation: Agar pehla hissa 12 se bara hai, toh pakka wo Day hai (DD/MM/YYYY)
            if (parseInt(day) > 12) {
                return `${year}-${month}-${day}`;
            }
            // Agar confusion ho (e.g., 05/06/2026), toh standard browser parsing check karein
            const testDate = new Date(dateStr);
            if (!isNaN(testDate)) return testDate.toISOString().split('T')[0];
        }
    }

    // Case B: Agar dash format hai lekin ulta hai (e.g., 31-05-2026)
    if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts[0].length === 2 && parts[2].length === 4) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }

    // 3. Fallback: Agar standard YYYY-MM-DD hai ya browser ise direct samajh sakta hai
    const finalCheck = new Date(dateStr);
    if (!isNaN(finalCheck)) {
        return finalCheck.toISOString().split('T')[0];
    }

    return null; // Agar bilkul hi kachra text ho
};
    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target.result;
            
            // raw: false aur cellDates: true karne se dates automatic sahi format mein aati hain
            const wb = XLSX.read(bstr, { type: 'binary', cellDates: true, dateNF: 'yyyy-mm-dd' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            
            // raw: false se Excel numerical dates ki jagah formatted string milegi
            const rawData = XLSX.utils.sheet_to_json(ws, { raw: false });

            // --- SAFEST MAPPING: Frontend se data bhejne se pehle sahi keys map karein ---
            const formattedMedicines = rawData.map(row => {
                // Agar Excel header mein expiryDate, expirydate, ya expiry_date kuch bhi ho, use safely pick karein
                const rawExpiry = row.expiryDate || row.expiry_date || row.expirydate || null;
                
                return {
                    name: row.name || '',
                    category: row.category || '',
                    quantity: parseInt(row.quantity) || 0,
                    salePrice: parseFloat(row.salePrice) || 0.0,
                    // Excel mein purchasePrice ho ya costPrice, dono ko pick karein
                    costPrice: parseFloat(row.purchasePrice || row.costPrice || 0.0), 
                    batchNo: row.batchNo || row.batch_no || '',
                    expiryDate: rawExpiry // Exact Java Entity field variable matches!
                };
            });

            console.log("Sending Formatted JSON to Backend:", formattedMedicines);

            try {
                // Backend API call
                const res = await axios.post(`${Config.CORE_API}/medicines/bulk-add`, formattedMedicines);
                
                // Safe Check: Agar status 200 ya 201 hai (chahe response mein message wrapper ho ya na ho)
                if (res.status === 200 || res.status === 201 || res.data.message === "SUCCESS!") {
                    alert(`${formattedMedicines.length} medicines successfully import ho gayin!`);
                    if (onImportSuccess) onImportSuccess(); // Table refresh function trigger
                }
            } catch (err) {
                console.error("Import error details:", err.response ? err.response.data : err);
                alert("Backend Error: Database constraints check karein ya values verify karein!");
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = null; // Input Reset
    };

    return (
        <div style={{ display: 'inline-block' }}>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".xlsx, .xls, .csv" 
                style={{ display: 'none' }} 
            />
            
            <button 
                onClick={handleButtonClick} 
                style={importButtonStyle}
                title="Upload Excel/CSV File"
            >
                📥 Import from Excel/CSV
            </button>
        </div>
    );
};

const importButtonStyle = {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

export default ExcelImport;