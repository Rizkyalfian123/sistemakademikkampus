import React from 'react';

export const StatCard = ({ stat }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${stat.iconBg} ${stat.iconColor}`}>
          <stat.icon size={24} />
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
        <p className="text-sm text-gray-500 font-medium mt-1">{stat.title}</p>
      </div>
    </div>
  );
};