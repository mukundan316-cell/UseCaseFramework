import React from 'react';

const RSALogo = () => (
  <div className="flex items-center space-x-3">
    {/* RSA Logo with Purple Sunburst */}
    <div className="flex items-center space-x-2">
      {/* RSA Text */}
      <div className="text-2xl font-bold text-gray-600 tracking-tight">
        RSA
      </div>
      
      {/* Purple Sunburst Icon */}
      <div className="relative w-8 h-8">
        <svg 
          width="32" 
          height="32" 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
        >
          {/* Sunburst rays */}
          <g fill="#9F4F96">
            <rect x="15" y="2" width="2" height="4" rx="1"/>
            <rect x="15" y="26" width="2" height="4" rx="1"/>
            <rect x="2" y="15" width="4" height="2" rx="1"/>
            <rect x="26" y="15" width="4" height="2" rx="1"/>
            <rect x="25.5" y="6.5" width="2" height="4" rx="1" transform="rotate(45 25.5 6.5)"/>
            <rect x="4.5" y="21.5" width="2" height="4" rx="1" transform="rotate(45 4.5 21.5)"/>
            <rect x="6.5" y="4.5" width="2" height="4" rx="1" transform="rotate(-45 6.5 4.5)"/>
            <rect x="21.5" y="25.5" width="2" height="4" rx="1" transform="rotate(-45 21.5 25.5)"/>
            {/* Additional shorter rays */}
            <rect x="23" y="5" width="1.5" height="3" rx="0.75" transform="rotate(30 23 5)"/>
            <rect x="8" y="24" width="1.5" height="3" rx="0.75" transform="rotate(30 8 24)"/>
            <rect x="5" y="8" width="1.5" height="3" rx="0.75" transform="rotate(-30 5 8)"/>
            <rect x="24" y="27" width="1.5" height="3" rx="0.75" transform="rotate(-30 24 27)"/>
            <rect x="27" y="23" width="1.5" height="3" rx="0.75" transform="rotate(60 27 23)"/>
            <rect x="12" y="4" width="1.5" height="3" rx="0.75" transform="rotate(60 12 4)"/>
            <rect x="4" y="12" width="1.5" height="3" rx="0.75" transform="rotate(-60 4 12)"/>
            <rect x="19" y="31" width="1.5" height="3" rx="0.75" transform="rotate(-60 19 31)"/>
          </g>
          
          {/* Central circle */}
          <circle cx="16" cy="16" r="6" fill="#9F4F96"/>
          <circle cx="16" cy="16" r="3" fill="white"/>
        </svg>
      </div>
    </div>
    
    {/* "an [intact] company" tagline */}
    <div className="text-sm text-gray-600 hidden sm:block">
      an <span className="text-red-600 font-medium border border-red-600 px-1 rounded">[intact]</span> company
    </div>
  </div>
);

interface RSAHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function RSAHeader({ 
  title = "GenAI Use Case Framework", 
  subtitle = "AI Strategy & Prioritization Platform" 
}: RSAHeaderProps) {
  return (
    <header className="rsa-header sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* RSA Logo and Branding */}
          <div className="flex items-center space-x-6">
            <RSALogo />
            <div className="hidden sm:block border-l border-gray-300 pl-6">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
          </div>
          
          {/* Navigation/Actions */}
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-3 text-sm text-gray-600">
              <span className="bg-gray-100 px-3 py-1 rounded-full">Commercial Insurance</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="bg-blue-50 text-rsa-blue px-3 py-1 rounded-full font-medium">AI Innovation</span>
            </div>
            
            {/* RSA Brand Badge */}
            <div className="bg-gradient-to-r from-rsa-purple to-rsa-blue text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md">
              Enterprise Platform
            </div>
          </div>
        </div>
        
        {/* Mobile title */}
        <div className="sm:hidden pb-4">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}