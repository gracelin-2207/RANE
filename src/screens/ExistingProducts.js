import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

import { db, storage } from "../firebase";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import "./ExistingProducts.css";

const ExistingProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingProduct, setEditingProduct] = useState(null);

  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [location, setLocation] = useState("");
  const [msdsFile, setMsdsFile] = useState(null);
  

  // ------------------------------------------
  // FETCH PRODUCTS FROM FIREBASE
  // ------------------------------------------

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const querySnapshot = await getDocs(
        collection(db, "products")
      );

      const productList = querySnapshot.docs.map((document) => ({
        id: document.id,
        ...document.data()
      }));

      setProducts(productList);

      console.log("Existing products:", productList);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ------------------------------------------
  // OPEN EDIT
  // ------------------------------------------

const handleEdit = (product) => {
  setEditingProduct(product);

  setLocation(product.location || "");
  setMin(product.min || "");
  setMax(product.max || "");
  setSupplierName(product.supplierName || "");
  setMsdsFile(null);
};

  // ------------------------------------------
  // SAVE CHANGES
  // ------------------------------------------

  const handleSave = async () => {
    if (!editingProduct) {
      return;
    }

    try {
      let msdsURL = editingProduct.msds || "";

      // Upload MSDS if a new file was selected
      if (msdsFile) {
        const msdsRef = ref(
          storage,
          `msds/${editingProduct.productCode}.pdf`
        );

        await uploadBytes(msdsRef, msdsFile);

        msdsURL = await getDownloadURL(msdsRef);
      }

      const productRef = doc(
        db,
        "products",
        editingProduct.id
      );

      await updateDoc(productRef, {
        location: location,
        min: min,
        max: max,
        supplierName: supplierName,
        msds: msdsURL
      });

      alert("Product updated successfully!");

      setEditingProduct(null);

      // Reload Firebase data
      fetchProducts();

    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    }
  };

  // ------------------------------------------
  // SEARCH
  // ------------------------------------------

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();

    return (
      String(product.productCode || "")
        .toLowerCase()
        .includes(search) ||

      String(product.materialDesc || "")
        .toLowerCase()
        .includes(search)
    );
  });

  return (
    <div className="existing-products-page">

      <h1>Existing Products</h1>

      {/* SEARCH */}

      <div className="search-container">

        <input
          type="text"
          placeholder="Search Product Code or Material Description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button onClick={fetchProducts}>
          Refresh
        </button>

      </div>

      {/* LOADING */}

      {loading && (
        <p>Loading products...</p>
      )}

      {/* PRODUCT TABLE */}

      {!loading && (
        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>S.No</th>
                <th>Product Code</th>
                <th>Material Description</th>
                <th>Location</th>
                <th>Min</th>
                <th>Max</th>
                <th>Supplier</th>
                <th>MSDS</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredProducts.map((product, index) => (

                <tr key={product.id}>

                  <td>{index + 1}</td>

                  <td>
                    {product.productCode || "-"}
                  </td>

                  <td>
                    {product.materialDesc || "-"}
                  </td>

                  <td>
                    {product.location || "-"}
                  </td>

                  <td>
                    {product.min || "-"}
                  </td>

                  <td>
                    {product.max || "-"}
                  </td>

                  <td>
                    {product.supplierName || "-"}
                  </td>

                  <td>
                    {product.msdsUrl ? (
                      <a
                        href={product.msdsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>

                    <button
                      onClick={() => handleEdit(product)}
                    >
                      EDIT
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

      {/* EDIT FORM */}

      {editingProduct && (

        <div className="edit-overlay">

          <div className="edit-box">

            <h2>Edit Product</h2>

            <p>
              <strong>Product Code:</strong>{" "}
              {editingProduct.productCode}
            </p>

            <p>
              <strong>Material:</strong>{" "}
              {editingProduct.materialDesc}
            </p>

            <label>
                Location
            </label>

            <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
            />

            <label>
              Minimum Stock
            </label>

            <input
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              placeholder="Enter minimum stock"
            />

            <label>
              Maximum Stock
            </label>

            <input
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              placeholder="Enter maximum stock"
            />

            <label>
              Supplier Name
            </label>

            <input
              type="text"
              value={supplierName}
              onChange={(e) =>
                setSupplierName(e.target.value)
              }
              placeholder="Enter supplier name"
            />

            <label>
              MSDS PDF
            </label>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setMsdsFile(e.target.files[0])
              }
            />

            <div className="edit-buttons">

              <button onClick={handleSave}>
                SAVE CHANGES
              </button>

              <button
                onClick={() => setEditingProduct(null)}
              >
                CANCEL
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default ExistingProducts;