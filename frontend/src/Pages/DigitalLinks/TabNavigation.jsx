import React from 'react';

const TabNavigation = ({ tabs, activeTab, onTabChange }) => (
  <div className="border-b border-gray-200 mb-6 overflow-x-auto">
    <div className="flex gap-0 min-w-max">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`pb-3 px-5 text-sm font-medium border-b-3 transition-all whitespace-nowrap ${
            activeTab === tab.id
            ? 'border-orange-500 text-orange-600 border-b-3'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          style={{
            borderBottomWidth: activeTab === tab.id ? '3px' : '0px'
          }}
        >
         {tab.label}
        </button>
      ))}
    </div>
  </div>
);

export default TabNavigation;