import React from 'react';

import Date from "../Date/Date.jsx";
import Card from '../Card/Card.jsx';

import "./Header.css";

function Header({ date, netWorth, totalAssets, totalLiabilities }) {
    return (
        <div className="header-container">
            <h1 className="header-title">💰 NetFolio 💰</h1>
            <Date date={date} />
            <Card title="Net Worth" value={netWorth} custom_class={"gradientBlue"} />
            <div className="header-grid">
                <Card title="Assets" value={totalAssets} custom_class={"gradientGreen"} />
                <Card title="Liabilities" value={totalLiabilities} custom_class={"gradientRed"} />
            </div>
        </div>
    );
}

export default Header;
