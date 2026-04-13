import React from 'react';
import "./Account.css";

import { formatCurrency } from '../helpers.jsx';

function Account({ name, balance, category, type }) {
    return (
        <div className='account-container'>
            <span>{name}</span>
            <span className={`acoount-amount ${type}`}>{formatCurrency(balance)}</span>
        </div>
    );
}

export default Account;
