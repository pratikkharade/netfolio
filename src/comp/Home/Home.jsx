import React, { use, useEffect } from "react";
import Logout from "../Logout/Logout";

import "./Home.css";
import { data_url } from "../../config.jsx";

export default function FinanceApp({ isAuthenticated }) {

    const [data, setData] = React.useState([]);
    const [date, setDate] = React.useState(null);

    const totalAssets = data
        .filter((d) => d.type === "asset")
        .reduce((sum, d) => sum + d.balance, 0);

    const totalLiabilities = data
        .filter((d) => d.type === "liability")
        .reduce((sum, d) => sum + d.balance, 0);

    const netWorth = totalAssets - totalLiabilities;

    async function fetchCSV() {
        let data_from_csv = [];
        try {
            const response = await fetch(data_url);
            const raw_data = await response.text();

            const rows = raw_data.split("\n").map(row => row.split(","));
            setDate(rows[0][1]);
            rows.splice(0, 2)

            data_from_csv = rows.map(r => {
                return {
                    name: r[0],
                    type: r[1],
                    balance: parseFloat(r[2] || 0),
                    notes: r[3].trim()
                }
            }).filter(d => d.balance !== 0);

            data_from_csv.sort((a, b) => {
                const typeCompare = a.type.localeCompare(b.type);
                if (typeCompare !== 0) return typeCompare;
                return b.balance - a.balance;
            });
            setData(data_from_csv);
        } catch (err) {
            console.error("Error fetching CSV:", err);
        }
    }

    const formatCurrency = (value) => {
        return value.toLocaleString(undefined, {
            style: "currency",
            currency: "USD",
        });
    };

    useEffect(() => {
        fetchCSV();
    }, []);

    if (isAuthenticated) {
        return (
            <div style={pageStyle}>
                <Logout />
                <div style={containerStyle}>
                    <div className="header-container">
                        <h1 style={titleStyle}>💰 NetFolio 💰</h1>
                        <h3 style={{ margin: 12 }}>Last Updated: {date}</h3>
                        <div style={{ ...cardStyle, background: gradientBlue, marginBottom: 12 }}>
                            <p style={labelStyle}>Net Worth</p>
                            <p style={valueStyle}>{formatCurrency(netWorth)}</p>
                        </div>
                        <div style={gridStyle}>
                            <div style={{ ...cardStyle, background: gradientGreen }}>
                                <p style={labelStyle}>Assets</p>
                                <p style={valueStyle}>{formatCurrency(totalAssets)}</p>
                            </div>

                            <div style={{ ...cardStyle, background: gradientRed }}>
                                <p style={labelStyle}>Liabilities</p>
                                <p style={valueStyle}>{formatCurrency(totalLiabilities)}</p>
                            </div>
                        </div>
                    </div>

                    <div style={listCardStyle}>
                        <h2 style={{ marginBottom: 0 }}>Accounts</h2>
                        <div style={{ overflow: "auto" }} >
                            {data.map((d, i) => (
                                <div key={i} style={i == data.length - 1 ? { ...rowParentStyle, borderBottom: "0px" } : rowParentStyle}>
                                    <div style={rowStyle}>
                                        <span>{d.name}</span>
                                        <span
                                            style={{
                                                color: d.type === "liability" ? "#ff4d6d" : "#22c55e",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {formatCurrency(d.balance)}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 12, opacity: 0.7, textAlign: "start" }}>{d.notes}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div >
        );
    }
}

// 🌈 Styles
const pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    padding: 16,
    color: "white",
    position: "relative",
};

const containerStyle = {
    maxWidth: 900,
    margin: "0 auto",
    height: "100%",
    display: "flex",
    flexDirection: "column",
};

const titleStyle = {
    fontSize: 30,
    fontWeight: 700,
    margin: "12px 0",
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

const listCardStyle = {
    background: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 16,
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
};

const rowParentStyle = {
    // display: "flex",
    // justifyContent: "space-between",
    padding: "8px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
};

const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    // padding: "10px 0 0",
    // borderBottom: "1px solid rgba(255,255,255,0.1)",
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
