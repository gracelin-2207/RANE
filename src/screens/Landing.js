import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useEffect } from "react";
// import { onAuthStateChanged } from "firebase/auth";

function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
        navigate("/home"); // Already logged in, redirect
        }
    });

    return () => unsubscribe(); // cleanup
    }, [navigate]);


  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Please fill in both email and password.");
      setIsSuccess(false);
      return;
    }

    if (!validateEmail(email)) {
      setMessage("Please enter a valid email address.");
      setIsSuccess(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Login successful!");
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (error) {
    //   console.error("Login failed:", error.message);
      setMessage("Invalid email or password. Please try again.");
      setIsSuccess(false);
    }
  };

  return (
    <div style={styles.container}>
      <img src="/Rane_Group_Logo.jpg" alt="Rane Logo" style={styles.logo} />

      <div style={styles.loginBox}>
        <h2 style={styles.title}>Employee Login</h2>
        <input
          type="email"
          placeholder="Email Address"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && (
          <div
            style={{
              ...styles.alertBox,
              backgroundColor: isSuccess ? "#d4edda" : "#f8d7da",
              color: isSuccess ? "#155724" : "#721c24",
              border: isSuccess
                ? "1px solid #c3e6cb"
                : "1px solid #f5c6cb",
            }}
          >
            {message}
          </div>
        )}

        <button
          style={styles.button}
          onClick={handleLogin}
          onMouseOver={(e) =>
            (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)
          }
          onMouseOut={(e) =>
            (e.target.style.backgroundColor = styles.button.backgroundColor)
          }
        >
          Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to bottom right, #0077be, #00c6ff)",
    fontFamily: "Segoe UI, sans-serif",
  },
  logo: {
    width: "160px",
    marginBottom: "30px",
    filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))",
  },
  loginBox: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0, 119, 190, 0.25)",
    width: "320px",
    textAlign: "center",
  },
  title: {
    marginBottom: "24px",
    fontSize: "22px",
    color: "#005b96",
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    border: "1px solid #cce0f4",
    borderRadius: "8px",
    fontSize: "14px",
  },
  alertBox: {
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    fontSize: "14px",
  },
  button: {
    backgroundColor: "#0077be",
    color: "white",
    padding: "12px",
    width: "100%",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
    marginTop: "15px",
    transition: "background-color 0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#005b96",
  },
};

export default LandingPage;
