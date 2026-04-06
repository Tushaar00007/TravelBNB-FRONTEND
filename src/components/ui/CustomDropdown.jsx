import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside";

/**
 * Premium Custom Dropdown Component
 * @param {Array} options - Array of objects { value, label, icon }
 * @param {any} selected - Current selected value
 * @param {Function} onChange - Callback on selection
 * @param {string} placeholder - Placeholder text
 * @param {string} className - Additional classes for the container
 */
const CustomDropdown = ({ 
    options = [], 
    selected, 
    onChange, 
    placeholder = "Select an option", 
    className = "",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useClickOutside(() => setIsOpen(false));

    const selectedOption = options.find(opt => opt.value === selected);

    return (
        <div ref={dropdownRef} className={`relative w-full ${isOpen ? 'z-50' : 'z-10'} ${className}`}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border ${isOpen ? 'border-orange-500 ring-2 ring-orange-500/10' : 'border-gray-200 dark:border-gray-700'} rounded-xl transition-all duration-300 text-left ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900/50' : ''}`}
            >
                <div className="flex items-center gap-3">
                    {selectedOption?.icon && <span className="text-orange-500">{selectedOption.icon}</span>}
                    <span className={`text-sm font-medium ${selectedOption ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown 
                    size={18} 
                    className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
                />
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {options.length > 0 ? (
                            options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors
                                        ${option.value === selected 
                                            ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold" 
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {option.icon && <span className={option.value === selected ? "text-orange-600" : "text-gray-400"}>{option.icon}</span>}
                                        {option.label}
                                    </div>
                                    {option.value === selected && <Check size={16} />}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-4 text-center text-sm font-medium text-gray-400">
                                No options available
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
