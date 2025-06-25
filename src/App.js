import { useState, useRef } from "react";
import { storage, db } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, doc, setDoc } from "firebase/firestore";
import axios from "axios";
import ExcelReaderScreen from "./excel";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import "./App.css";

function App() {
  const [imageBlob, setImageBlob] = useState(null);
  const [productCode, setProductCode] = useState("");
  const [materialDesc, setMaterialDesc] = useState("");
  const [location, setLocation] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start the camera
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  // Capture from camera
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      setImageBlob(blob);
    }, "image/jpeg");
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageBlob(file); // Directly use uploaded file
    }
  };

  const handleUpload = async () => {
    if (!imageBlob || !productCode || !materialDesc) {
      alert("Please fill in all fields and upload or capture an image.");
      return;
    }

    const productImgRef = ref(storage, `products/${productCode}.jpg`);

    try {
      // Upload product image
      await uploadBytes(productImgRef, imageBlob, {
        contentType: "image/jpeg",
      });
      const imageUrl = await getDownloadURL(productImgRef);

      // Send product data to backend to generate QR
      const response = await axios.post("http://localhost:5000/generate-qr", {
        productCode,
        materialDesc,
        imageUrl,
      });

      const qrBase64 = response.data.qrImage; // Should be data:image/png;base64,...
      console.log("QR Base64:", qrBase64);
      const qrBlob = await (await fetch(qrBase64)).blob();

      // Upload QR image as PNG
      const qrRef = ref(storage, `qr_codes/${productCode}_qr.png`);
      await uploadBytes(qrRef, qrBlob);
      const qrUrl = await getDownloadURL(qrRef);

      // Save metadata to Firestore
      const docRef = doc(collection(db, "products"), productCode);
      await setDoc(docRef, {
        productCode,
        materialDesc,
        location,
        imageUrl,
        qrUrl,
        timestamp: new Date(),
      });

      alert("Upload successful & QR generated!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. See console for details.");
    }
  };

  return (
    <Router>
    <div className="App">
      <header className="App-header">
        <h1>Product QR - Rane</h1>
        <h2>Add Product to Generate QR Code</h2>

        <input
          type="text"
          placeholder="Product Code"
          value={productCode}
          onChange={(e) => setProductCode(e.target.value)}
        />
        <input
          type="text"
          placeholder="Material Description"
          value={materialDesc}
          onChange={(e) => setMaterialDesc(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div style={{ margin: "10px 0" }}>
          <video ref={videoRef} autoPlay playsInline width="300" />
          <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <button onClick={startCamera}>Start Camera</button>
          <button onClick={capturePhoto} disabled={!videoRef.current?.srcObject}>
            Capture Photo
          </button>
        </div>

        <p>OR upload an image:</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />

        <button onClick={handleUpload} style={{ marginTop: "15px" }}>
          Upload & Generate QR
        </button>
        <Link to="/excel">
          <button>Open Excel Reader</button>
        </Link>

        <Routes>
          <Route path="/excel" element={<ExcelReaderScreen />} />
        </Routes>
      </header>
    </div>
    </Router>
  );
}

export default App;
