import React from 'react';

const SectionDivider = ({ className = "" }) => {
  return (
    <div className={`my-8 border-t border-gray-100 dark:border-gray-800 ${className}`} aria-hidden="true" />
  );
};

export default SectionDivider;
