'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header: React.FC = () => {
  const pathname = usePathname();
  
  // Define the navigation links
  const navLinks = [
    { href: '/markets', label: 'Markets' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/create', label: 'Create' },
    { href: '/docs', label: 'Docs' }
  ];
  
  // Skip header on landing page
  if (pathname === '/') return null;
  
  return (
    <header className="backdrop-blur-md bg-black/20 border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-teodor-italic text-xl font-bold text-white hover:text-white/80 transition-colors">
                frfn
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || 
                                (link.href !== '/' && pathname?.startsWith(link.href));
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-3 py-2 text-sm ${
                      isActive
                        ? 'text-[#F900BF] border-b-2 border-[#F900BF]'
                        : 'text-white/70 hover:text-white border-b-2 border-transparent hover:border-white/30'
                    } transition-all duration-200`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="backdrop-panel p-1">
              <ConnectButton />
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <div className="backdrop-panel p-1">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="sm:hidden backdrop-blur-md bg-black/30 animate-fadeIn">
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || 
                            (link.href !== '/' && pathname?.startsWith(link.href));
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 text-base ${
                  isActive
                    ? 'text-[#F900BF] border-l-4 border-[#F900BF] bg-black/40'
                    : 'text-white/70 hover:text-white border-l-4 border-transparent hover:border-white/30'
                } transition-all duration-200`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;