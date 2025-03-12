'use client';

import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-16 w-16'
};

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  message = 'Loading...', 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer gradient circle */}
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin-slow`}>
          <div className="absolute inset-0.5 bg-black rounded-full"></div>
        </div>
        
        {/* Inner pulsing dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse-subtle"></div>
        </div>
      </div>
      
      {message && (
        <p className="mt-4 text-white/70 text-sm">{message}</p>
      )}
    </div>
  );
};

export default Loading; 