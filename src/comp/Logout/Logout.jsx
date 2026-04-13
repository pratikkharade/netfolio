import React from "react";

import "./Logout.css";

export default function Logout() {
    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (!confirmLogout) return;
        localStorage.setItem("auth", "false");
        window.location.reload();
    }
    return (
        <div className="logout-icon" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </div>
    );
}
