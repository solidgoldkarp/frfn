'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  
  // Don't wrap the landing page as it has its own layout
  if (isLandingPage) {
    return <>{children}</>;
  }
  
  return (
    <div className={`flex-grow flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      <div className="backdrop-panel p-6 animate-fadeIn flex-grow">
        {children}
      </div>
    </div>
  );
};

export default PageContainer; 