export const fetchExchangeRate = async () => {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        return data.rates.INR; // e.g. 83.something
    } catch (error) {
        console.error("Failed to fetch exchange rate, using fallback:", error);
        return 83; // fallback to static rate if API fails
    }
};

export const convertCurrency = (priceInINR, targetCurrency, exchangeRate) => {
    if (!priceInINR) return 0;

    if (targetCurrency === 'USD') {
        const converted = priceInINR / (exchangeRate || 83);
        return parseFloat(converted.toFixed(2)); // Show 2 decimals for precision
    }

    return priceInINR; // It's already in INR
};
