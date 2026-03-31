import React, { useState } from "react";

import { hash_url } from "../../config.jsx";

export default function Login({ setIsAuthenticated }) {
    const [password, setPassword] = useState("");

    async function generateHash(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }

    async function fetchStoredHash() {
        const res = await fetch(hash_url + "&t=" + Date.now());
        const text = await res.text();
        return text.trim().split(",")[1];
    }

    async function handleLogin() {
        const inputHash = await generateHash(password);
        const storedHash = await fetchStoredHash();

        if (inputHash === storedHash) {
            localStorage.setItem("auth", "true");
            setIsAuthenticated(true);
        } else {
            alert("Wrong password");
        }
    }

    return (
        <div style={loginPageStyle}>
            <div style={loginCardStyle}>
                <h2 style={{ marginBottom: 10, color: "#333" }}>🔒 Secure Login</h2>
                <p style={{ fontSize: 12, color: "#666" }}>
                    Enter your password to access dashboard
                </p>

                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                />

                <button onClick={handleLogin} style={buttonStyle}>
                    Unlock
                </button>
            </div>
        </div>
    );
}

// 🎨 Styles
const loginPageStyle = {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1e293b, #0f172a)",
};

const loginCardStyle = {
    background: "white",
    padding: 24,
    borderRadius: 16,
    width: 300,
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const inputStyle = {
    width: "100%",
    padding: 10,
    marginTop: 15,
    borderRadius: 8,
    textAlign: "center",
    border: "1px solid #ddd",
};

const buttonStyle = {
    marginTop: 15,
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
};
