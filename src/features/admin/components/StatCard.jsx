import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, trend, trendValue, color }) => {
  const isPositive = trend === 'up';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg shadow-gray-200/50 group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} />
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
