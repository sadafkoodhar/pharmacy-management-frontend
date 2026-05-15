import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { Config } from '../config';

const ExcelImport = ({ onImportSuccess }) => {
    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        // Jab user button/icon pe click karega, to hidden file input trigger hoga
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            try {
                // Backend hit!
                const res = await axios.post(`${Config.CORE_API}/medicines/bulk-add`, data);
                if (res.data.message === "SUCCESS!") {
                    alert(`${data.length} medicines successfully import ho gayin!`);
                    onImportSuccess(); // Table refresh
                }
            } catch (err) {
                console.error("Import error:", err);
                alert("Backend Error: Check if column names match!");
            }
        };
        reader.readAsBinaryString(file);
        // Input ko reset karna taaki same file dubara upload ho sake
        e.target.value = null;
    };

    return (
        <div style={{ display: 'inline-block' }}>
            {/* Hidden Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".xlsx, .xls" 
                style={{ display: 'none' }} 
            />
            
            {/* Clickable Icon/Button */}
            <button 
                onClick={handleButtonClick} 
                style={importButtonStyle}
                title="Upload Excel File"
            >
                📥 Import from Excel
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
    gap: '80px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

export default ExcelImport;