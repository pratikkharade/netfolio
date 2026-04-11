import React from 'react';
import "./Account.css";

function Account({ name, balance, category, type, formatCurrency }) {
    return (
        <div className='account-container'>
            {/* <div className='account' style={rowStyle}> */}
            <span>{name}</span>
            <span
                style={{
                    color: type === "liability" ? "#ff4d6d" : "#22c55e",
                    fontWeight: 600,
                }}
            >
                {formatCurrency(balance)}
            </span>
        </div>
    );
}

export default Account;