import React from "react";

export default function Home() {
    const data = [
        { name: "Chase Checking", type: "asset", balance: 5000 },
        { name: "Discover Savings", type: "asset", balance: 12000 },
        { name: "Robinhood", type: "asset", balance: 8000 },
        { name: "Chase Credit Card", type: "liability", balance: 2000 },
        { name: "Amex", type: "liability", balance: 1500 },
        { name: "Discover Credit", type: "liability", balance: 1000 },
        { name: "Capital One", type: "liability", balance: 800 },
    ];

    const totalAssets = data
        .filter((d) => d.type === "asset")
        .reduce((sum, d) => sum + d.balance, 0);

    const totalLiabilities = data
        .filter((d) => d.type === "liability")
        .reduce((sum, d) => sum + d.balance, 0);

    const netWorth = totalAssets - totalLiabilities;

    return (
        <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: 24 }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
                <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 20 }}>
                    Net Worth Dashboard
                </h1>

                <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                    <div style={cardStyle}>
                        <p style={labelStyle}>Assets</p>
                        <p style={valueStyle}>${totalAssets.toLocaleString()}</p>
                    </div>

                    <div style={cardStyle}>
                        <p style={labelStyle}>Liabilities</p>
                        <p style={valueStyle}>${totalLiabilities.toLocaleString()}</p>
                    </div>

                    <div style={cardStyle}>
                        <p style={labelStyle}>Net Worth</p>
                        <p style={valueStyle}>${netWorth.toLocaleString()}</p>
                    </div>
                </div>

                <div style={cardStyle}>
                    <h2 style={{ marginBottom: 10 }}>Accounts</h2>
                    {data.map((d, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "8px 0",
                                borderBottom: "1px solid #eee",
                            }}
                        >
                            <span>{d.name}</span>
                            <span
                                style={{
                                    color: d.type === "liability" ? "#e11d48" : "#16a34a",
                                    fontWeight: 500,
                                }}
                            >
                                ${d.balance.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const cardStyle = {
    background: "white",
    padding: 16,
    borderRadius: 12,
    flex: 1,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const labelStyle = {
    fontSize: 12,
    color: "#666",
};

const valueStyle = {
    fontSize: 20,
    fontWeight: 600,
};

// export default FinanceApp;