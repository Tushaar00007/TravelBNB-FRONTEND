import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useClickOutside } from '../../../hooks/useClickOutside';

function CustomDropdown({ options, value, onChange, label, icon }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useClickOutside(() => setIsOpen(false));

    return (
        <div ref={dropdownRef} className="flex-1 relative w-full group">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-4 px-6 py-3 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                    isOpen ? "border-orange-500 bg-white dark:bg-gray-800 shadow-lg shadow-orange-500/10" : "border-transparent hover:bg-white dark:hover:bg-gray-800"
                }`}
            >
                {icon && <div className={`${isOpen ? "text-orange-500" : "text-gray-400 group-hover:text-orange-500"} transition-colors`}>{icon}</div>}
                
                <div className="flex-1">
                    {label && <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>}
                    <p className={`text-sm font-bold ${value ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                        {value || "Select..."}
                    </p>
                </div>

                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-400 group-hover:text-orange-500 transition-colors"
                >
                    <ChevronDown size={18} strokeWidth={3} />
                </motion.div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#111827] dark:bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60] backdrop-blur-2xl"
                    >
                        <div className="py-2 flex flex-col">
                            {options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        onChange(option);
                                        setIsOpen(false);
                                    }}
                                    className={`px-6 py-3.5 text-left text-sm font-bold transition-all ${
                                        value === option 
                                            ? "bg-orange-500 text-white" 
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default CustomDropdown;
