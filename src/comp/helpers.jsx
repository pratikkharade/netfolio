export const formatCurrency = (value) => {
    return value.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
    });
};

export const getTotalByType = (data, type) => {
    return data
        .filter((d) => d.type === type)
        .reduce((sum, d) => sum + d.balance, 0);
};

export async function generateHash(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

import { hash_url } from "../config.jsx";
export async function fetchStoredHash() {
    const res = await fetch(hash_url + "&t=" + Date.now());
    const text = await res.text();
    return text.trim().split(",")[1];
}
