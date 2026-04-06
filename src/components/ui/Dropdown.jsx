import React from "react";
import { useClickOutside } from "../../hooks/useClickOutside";

/**
 * Reusable Dropdown component with smooth animations and outside click detection.
 */
import { X } from "lucide-react";

/**
 * Reusable Dropdown component with smooth animations and outside click detection.
 * Supports full-screen modal behavior on mobile.
 */
const Dropdown = ({ 
    isOpen, 
    onClose, 
    children, 
    className = "", 
    position = "md:top-full md:left-0",
    animate = "animate-fade-in",
    fullScreenMobile = true
}) => {
    const dropdownRef = useClickOutside(() => {
        if (isOpen && !fullScreenMobile) onClose();
    });

    if (!isOpen) return null;

    const baseClasses = fullScreenMobile 
        ? "fixed inset-0 z-[100] bg-white dark:bg-gray-900 md:absolute md:inset-auto"
        : "absolute";

    const desktopClasses = `md:mt-4 md:rounded-[2rem] md:shadow-2xl md:border md:border-gray-100 md:dark:border-gray-800 md:z-50 md:overflow-hidden`;

    return (
        <div 
            ref={dropdownRef}
            className={`${baseClasses} ${position} ${desktopClasses} ${animate} ${className} overflow-y-auto h-screen md:h-auto w-screen md:w-auto`}
        >
            {/* Mobile Header with Close Button */}
            {fullScreenMobile && (
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 md:hidden bg-white dark:bg-gray-900 sticky top-0 z-10">
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Search</h3>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                    >
                        <X size={24} />
                    </button>
                </div>
            )}
            <div className="md:max-h-[80vh] overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

export default Dropdown;
