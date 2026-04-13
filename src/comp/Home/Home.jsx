import React, { use, useEffect } from "react";
import Logout from "../Logout/Logout";

import "./Home.css";
import { data_url } from "../../config.jsx";

import Header from "../Header/Header.jsx";
import Details from "../Details/Details.jsx";

import { getTotalByType } from "../helpers.jsx";

export default function FinanceApp({ isAuthenticated }) {

    const [data, setData] = React.useState([]);
    const [date, setDate] = React.useState(null);

    const [checking, setChecking] = React.useState([]);
    const [saving, setSaving] = React.useState([]);
    const [investment, setInvestment] = React.useState([]);
    const [retirement, setRetirement] = React.useState([]);
    const [rent, setRent] = React.useState([]);
    const [cc, setCC] = React.useState([]);

    const [totalAssets, setTotalAssets] = React.useState(0);
    const [totalLiabilities, setTotalLiabilities] = React.useState(0);
    const [netWorth, setNetWorth] = React.useState(0);

    useEffect(() => {
        const assets = getTotalByType(data, "asset");
        setTotalAssets(assets);

        const liabilities = getTotalByType(data, "liability");
        setTotalLiabilities(liabilities);

        const netWorth = assets - liabilities;
        setNetWorth(netWorth);
    }, [data]);

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
            <div className="home-container">
                <Logout />
                <div className="home-content">
                    <Header
                        date={date}
                        netWorth={netWorth}
                        totalAssets={totalAssets}
                        totalLiabilities={totalLiabilities}
                    />
                    <Details
                        checking={checking}
                        saving={saving}
                        investment={investment}
                        retirement={retirement}
                        rent={rent}
                        cc={cc}
                    />
                </div>
            </div >
        );
    }
}
