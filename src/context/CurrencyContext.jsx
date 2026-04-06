import { createContext, useState, useEffect } from 'react';
import { fetchExchangeRate } from '../utils/convertCurrency';
import Cookies from 'js-cookie';

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    const defaultCurrency = Cookies.get('currency') || localStorage.getItem('currency') || 'INR';
    const [currency, setCurrency] = useState(defaultCurrency);
    const [exchangeRate, setExchangeRate] = useState(null);

    // Fetch realtime rate on load
    useEffect(() => {
        const loadExchangeRate = async () => {
            const cachedRate = localStorage.getItem('exchangeRate_INR');
            const cachedTime = localStorage.getItem('exchangeRate_time');

            // Cache for 1 hour to avoid hitting API too often, but keep it "realtime"
            if (cachedRate && cachedTime && (Date.now() - parseInt(cachedTime)) < 1000 * 60 * 60) {
                setExchangeRate(parseFloat(cachedRate));
            } else {
                const rate = await fetchExchangeRate();
                setExchangeRate(rate);
                localStorage.setItem('exchangeRate_INR', rate);
                localStorage.setItem('exchangeRate_time', Date.now());
            }
        };

        loadExchangeRate();
    }, []);

    const handleSetCurrency = (newCurrency) => {
        setCurrency(newCurrency);
        Cookies.set('currency', newCurrency, { expires: 365 });
        localStorage.setItem('currency', newCurrency);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, exchangeRate }}>
            {children}
        </CurrencyContext.Provider>
    );
};
