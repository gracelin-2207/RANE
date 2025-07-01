import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path as needed
// import { useEffect } from "react";
// import { onAuthStateChanged } from "firebase/auth";
// import { useNavigate } from "react-router-dom";


export default function ExcelReaderScreen() {
  const [rows, setRows] = useState([]);
  // const [headerRow, setHeaderRow] = useState([]);
  const [status, setStatus] = useState('');
  const [parsedData, setParsedData] = useState([]);
  // const navigate = useNavigate();
  
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     if (!user) {
  //       navigate("/");
  //     } 
  //   });

  //   return () => unsubscribe();
  // }, [navigate]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus('Reading file...');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // 🔍 Find the second non-empty row (at least one non-zero cell)
      const nonEmptyRows = rawRows.filter(row =>
        row.some(cell => cell !== null && cell !== undefined && cell !== '')
      );

      if (nonEmptyRows.length < 2) {
        setStatus('❌ Not enough non-empty rows to determine header.');
        return;
      }
      

      const detectedHeaderRow = nonEmptyRows[1]; 
      // setHeaderRow(detectedHeaderRow);

      const startDataIndex = rawRows.findIndex(row => row === detectedHeaderRow) + 1;

      const dataRows = rawRows.slice(startDataIndex);

      const jsonData = dataRows.map((row) => {
        const obj = {};
        detectedHeaderRow.forEach((header, i) => {
          obj[header] = row[i] ?? '';
        });
        return obj;
      });

      // console.log('Detected Header Row:', detectedHeaderRow);
      // console.log('Parsed Data:', jsonData);
      setParsedData(jsonData);
      setRows(rawRows);
      setStatus(`✅ Loaded ${jsonData.length} rows. Ready to upload.`);
    } catch (err) {
      console.error('Error reading Excel file:', err);
      setStatus('❌ Failed to read file.');
    }
  };

    const handleUpload = async () => {
      if (!parsedData.length) return;

      setStatus('🔄 Clearing existing documents...');

      try {
        const collectionRef = collection(db, 'RM_SAP');

        // Step 1: Get all existing documents
        const snapshot = await getDocs(collectionRef);

        // Step 2: Delete all existing documents
        const deletePromises = snapshot.docs.map((docSnap) =>
          deleteDoc(doc(db, 'RM_SAP', docSnap.id))
        );
        await Promise.all(deletePromises);

        setStatus('📥 Uploading new data to Firestore...');

        // Step 3: Upload new documents
        for (const item of parsedData) {
          await addDoc(collectionRef, item);
        }

        setStatus(`✅ Uploaded ${parsedData.length} rows to Firestore.`);
      } catch (err) {
        console.error('Upload error:', err);
        setStatus('❌ Upload failed.');
      }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📄 Excel to Firestore Uploader</h2>

        <input type="file" accept=".xls,.xlsx" onChange={handleFileUpload} style={styles.fileInput} />

        {status && <p style={styles.status}>{status}</p>}

        {rows.length > 0 && (
          <>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} style={styles.cell}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parsedData.length > 0 && (
              <button onClick={handleUpload} style={styles.uploadButton}>
                🚀 Upload to Firestore
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: '50px',
    fontFamily: 'Segoe UI, Roboto, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '30px 40px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '90%',
    maxWidth: '1000px',
  },
  title: {
    marginBottom: '20px',
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
  },
  fileInput: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    marginBottom: '20px',
  },
  status: {
    color: '#007bff',
    marginBottom: '15px',
  },
  tableWrapper: {
    overflowX: 'auto',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  cell: {
    border: '1px solid #ddd',
    padding: '10px',
    backgroundColor: '#fafafa',
    fontSize: '14px',
    color: '#333',
  },
  uploadButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};
