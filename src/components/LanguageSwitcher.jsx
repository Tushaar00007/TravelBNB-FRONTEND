import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import Cookies from "js-cookie";

const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिन्दी" },
    { code: "mr", name: "मराઠી" },
    { code: "bn", name: "বাংলা" },
    { code: "ta", name: "தமிழ்" },
    { code: "ml", name: "മലയാളം" },
    { code: "kn", name: "ಕನ್ನಡ" },
    { code: "pa", name: "ਪੰਜਾਬੀ" },
    { code: "gu", name: "ગુજરાતી" }
];

function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const currentLanguage = Cookies.get("i18nextLng") || i18n.language || localStorage.getItem("i18nextLng") || "en";

    const changeLanguage = (e) => {
        const val = e.target.value;
        Cookies.set("i18nextLng", val, { expires: 365 });
        i18n.changeLanguage(val);
    };

    return (
        <div className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors cursor-pointer">
            <Globe size={18} className="text-gray-600 dark:text-gray-300" />
            <select
                value={currentLanguage}
                onChange={changeLanguage}
                className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 outline-none cursor-pointer appearance-none pr-3"
            >
                {languages.map((lng) => (
                    <option key={lng.code} value={lng.code} className="text-gray-900 bg-white dark:bg-gray-800 dark:text-white">
                        {lng.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default LanguageSwitcher;
