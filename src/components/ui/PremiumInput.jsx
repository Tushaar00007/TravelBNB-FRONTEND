import React from 'react';
import { motion } from 'framer-motion';

const PremiumInput = ({ 
  label, 
  id, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  icon: Icon, 
  error, 
  multiline = false,
  className = "" 
}) => {
  const InputComponent = multiline ? "textarea" : "input";
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 block"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200">
            <Icon size={18} />
          </div>
        )}
        <InputComponent
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={multiline ? 4 : undefined}
          className={`
            w-full bg-white dark:bg-gray-900 
            text-gray-900 dark:text-gray-100 
            border border-gray-200 dark:border-gray-800 
            rounded-2xl px-4 py-3.5 
            ${Icon ? 'pl-11' : 'pl-4'} 
            placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 
            transition-all duration-200
            hover:border-gray-300 dark:hover:border-gray-700
            shadow-sm
            ${error ? 'border-red-500 ring-2 ring-red-500/10' : ''}
            ${multiline ? 'resize-none' : ''}
          `}
        />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 ml-1 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default PremiumInput;
