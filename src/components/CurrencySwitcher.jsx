import { useContext } from "react";
import { CurrencyContext } from "../context/CurrencyContext";

function CurrencySwitcher() {
    const { currency, setCurrency } = useContext(CurrencyContext);

    return (
        <div className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors cursor-pointer">
            <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 outline-none cursor-pointer appearance-none pr-1"
            >
                <option value="INR" className="text-gray-900 bg-white dark:bg-gray-800 dark:text-white">₹ INR</option>
                <option value="USD" className="text-gray-900 bg-white dark:bg-gray-800 dark:text-white">$ USD</option>
            </select>
        </div>
    );
}

export default CurrencySwitcher;
