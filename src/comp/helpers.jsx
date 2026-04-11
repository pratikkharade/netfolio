const formatCurrency = (value) => {
    return value.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
    });
};

export default formatCurrency;