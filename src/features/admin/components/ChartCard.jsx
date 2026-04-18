import React from 'react';

const ChartCard = ({ title, subtitle, icon: Icon, children }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-gray-50 text-gray-600">
              <Icon size={18} />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs font-semibold text-gray-400 hover:text-gray-600 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors">
            12M
          </button>
          <button className="text-xs font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-md transition-colors">
            30D
          </button>
          <button className="text-xs font-semibold text-gray-400 hover:text-gray-600 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors">
            7D
          </button>
        </div>
      </div>
      <div className="flex-1 w-full min-h-[240px]">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
