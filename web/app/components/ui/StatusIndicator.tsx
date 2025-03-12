'use client';

import React from 'react';

interface StatusIndicatorProps {
  status: 'active' | 'pending' | 'inactive' | 'error';
  label?: string;
  className?: string;
}

const statusColors = {
  active: 'bg-green-500',
  pending: 'bg-yellow-500',
  inactive: 'bg-gray-500',
  error: 'bg-red-500',
};

const statusPingColors = {
  active: 'bg-green-400',
  pending: 'bg-yellow-400',
  inactive: 'bg-gray-400',
  error: 'bg-red-400',
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  label = status.charAt(0).toUpperCase() + status.slice(1),
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative flex items-center">
        <div className={`h-2 w-2 rounded-full ${statusColors[status]}`}></div>
        <div className={`absolute h-2 w-2 rounded-full ${statusPingColors[status]} animate-ping`}></div>
      </div>
      <span className="text-white text-xs">{label}</span>
    </div>
  );
};

export default StatusIndicator; 