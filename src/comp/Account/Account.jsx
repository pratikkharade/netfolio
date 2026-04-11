import React from 'react';
import "./Account.css";

import formatCurrency from '../helpers.jsx';

function Account({ name, balance, category, type }) {
    return (
        <div className='account-container'>
            {/* <div className='account' style={rowStyle}> */}
            <span>{name}</span>
            <span
                style={{
                    color: type === "liability" ? "#ff4d6d" : "#22c55e",
                    fontWeight: "bold",
                }}
            >
                {formatCurrency(balance)}
            </span>
        </div>
    );
}

export default Account;