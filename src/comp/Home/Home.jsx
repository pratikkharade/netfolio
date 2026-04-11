import React, { use, useEffect } from "react";
import Logout from "../Logout/Logout";

import "./Home.css";
import { data_url } from "../../config.jsx";
import Carousel from "../Carousel/Carousel.jsx";

import formatCurrency from "../helpers.jsx";

export default function FinanceApp({ isAuthenticated }) {

    const [data, setData] = React.useState([]);
    const [date, setDate] = React.useState(null);

    const [checking, setChecking] = React.useState([]);
    const [saving, setSaving] = React.useState([]);
    const [investment, setInvestment] = React.useState([]);
    const [retirement, setRetirement] = React.useState([]);
    const [rent, setRent] = React.useState([]);
    const [cc, setCC] = React.useState([]);

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
                    category: r[2].trim(),
                    balance: parseFloat(r[3] || 0)
                }
            }).filter(d => d.balance !== 0);

            const categorizedData = data_from_csv.reduce(
                (acc, item) => {
                    if (item.category === "checking") acc.checking.push(item);
                    if (item.category === "saving") acc.saving.push(item);
                    if (item.category === "investment") acc.investment.push(item);
                    if (item.category === "retirement") acc.retirement.push(item);
                    if (item.category === "rent") acc.rent.push(item);
                    if (item.category === "cc") acc.cc.push(item);
                    return acc;
                },
                { checking: [], saving: [], investment: [], retirement: [], rent: [], cc: [] }
            );

            setChecking(categorizedData.checking);
            setSaving(categorizedData.saving);
            setInvestment(categorizedData.investment);
            setRetirement(categorizedData.retirement);
            setRent(categorizedData.rent);
            setCC(categorizedData.cc);

            setData(data_from_csv);
        } catch (err) {
            console.error("Error fetching CSV:", err);
        }
    }

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
                        <h2 style={{ marginBottom: "8px", fontFamily: "inherit" }}>Accounts</h2>
                        <div style={{ overflow: "auto" }} >
                            <Carousel type="asset" title="Checking Accounts" data={checking} />
                            <Carousel type="asset" title="Saving Accounts" data={saving} />
                            <Carousel type="asset" title="Investment Accounts" data={investment} />
                            <Carousel type="asset" title="Retirement Accounts" data={retirement} />
                            {
                                rent.length > 0 && <Carousel type="liability" title="Rent & Utilities" data={rent} />
                            }
                            {
                                cc.length > 0 && <Carousel type="liability" title="Credit Cards" data={cc} />
                            }
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
    fontFamily: "fantasy"
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
