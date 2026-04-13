import React, { useState } from "react";

import { generateHash, fetchStoredHash } from "../helpers.jsx";

import "./Login.css";

function Login({ setIsAuthenticated }) {
    const [password, setPassword] = useState("");

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
        <div className="login-page-wrapper" >
            <div className="login-card" >
                <h2 style={{ marginBottom: 10, color: "#333" }}>🔒 Secure Login</h2>
                <p style={{ fontSize: 12, color: "#666" }}>
                    Enter your password to access dashboard
                </p>

                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-card-input"
                />

                <button onClick={handleLogin} className="login-card-button" >
                    Unlock
                </button>
            </div>
        </div>
    );
}

export default Login;
