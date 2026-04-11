import React from 'react';

import formatCurrency from "../helpers.jsx";
import Date from "../Date/Date.jsx";
import Loading from '../Loading/Loading.jsx';

function Header({ date, netWorth, totalAssets, totalLiabilities }) {
    return (
        <div className="header-container">
            <h1 style={titleStyle}>💰 NetFolio 💰</h1>
            <Date date={date} />
            <div style={{ ...cardStyle, background: gradientBlue, marginBottom: 12 }}>
                <div style={labelStyle}>Net Worth</div>
                <div style={valueStyle}>{netWorth ? formatCurrency(netWorth) : <Loading />}</div>
            </div>
            <div style={gridStyle}>
                <div style={{ ...cardStyle, background: gradientGreen }}>
                    <div style={labelStyle}>Assets</div>
                    <div style={valueStyle}>{totalAssets ? formatCurrency(totalAssets) : <Loading />}</div>
                </div>

                <div style={{ ...cardStyle, background: gradientRed }}>
                    <div style={labelStyle}>Liabilities</div>
                    <div style={valueStyle}>{totalLiabilities ? formatCurrency(totalLiabilities) : <Loading />}</div>
                </div>
            </div>
        </div>
    );
}

export default Header;

const titleStyle = {
    fontSize: 30,
    fontWeight: 700,
    margin: "12px 0",
    fontFamily: "FontAwesome"
};

const gridStyle = {
    display: "flex",
    gap: 12,
    marginBottom: 12,
};

const cardStyle = {
    padding: 12,
    borderRadius: 16,
    flex: 1,
    color: "white",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
};

const labelStyle = {
    fontSize: 20,
    opacity: 0.8,
    fontWeight: 700,
};

const valueStyle = {
    fontSize: 22,
    fontWeight: 700,
};

// 🎨 Gradients
const gradientGreen = "linear-gradient(135deg, #16a34a, #4ade80)";
const gradientRed = "linear-gradient(135deg, #dc2626, #fb7185)";
const gradientBlue = "linear-gradient(135deg, #2563eb, #60a5fa)";
