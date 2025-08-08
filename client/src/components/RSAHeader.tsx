import React from 'react';

const RSALogo = () => (
  <svg 
    width="120" 
    height="40" 
    viewBox="0 0 120 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-auto"
  >
    <rect width="120" height="40" rx="4" fill="#005DAA"/>
    <path 
      d="M12 32V12H20.5C23.5 12 25.8 12.6 27.4 13.8C29 15 29.8 16.8 29.8 19.2C29.8 20.6 29.4 21.8 28.6 22.8C27.8 23.8 26.7 24.4 25.3 24.6V24.8C26.8 25 28.1 25.7 29.1 26.9C30.1 28.1 30.6 29.6 30.6 31.4C30.6 34.2 29.7 36.2 27.9 37.4C26.1 38.6 23.6 39.2 20.4 39.2H12V32ZM17.8 23.4H20.5C21.9 23.4 23 23 23.8 22.2C24.6 21.4 25 20.4 25 19.2C25 18 24.6 17 23.8 16.4C23 15.8 21.9 15.5 20.5 15.5H17.8V23.4ZM17.8 35.7H20.9C22.7 35.7 24.1 35.3 25.1 34.5C26.1 33.7 26.6 32.6 26.6 31.2C26.6 29.8 26.1 28.7 25.1 27.9C24.1 27.1 22.7 26.7 20.9 26.7H17.8V35.7Z" 
      fill="white"
    />
    <path 
      d="M36 39.2V12H48.5V15.5H41.8V24.2H47.8V27.7H41.8V35.7H48.5V39.2H36Z" 
      fill="white"
    />
    <path 
      d="M58 39.2L48.5 12H54.2L60.5 30.8H60.7L67 12H72.7L63.2 39.2H58Z" 
      fill="white"
    />
    <path 
      d="M78 39.2V12H90.5V15.5H83.8V23.5H89.2V27H83.8V35.7H90.5V39.2H78Z" 
      fill="white"
    />
    <path 
      d="M98 39.2V12H110.5V15.5H103.8V24.2H109.8V27.7H103.8V35.7H110.5V39.2H98Z" 
      fill="white"
    />
  </svg>
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
    <header className="rsa-header sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* RSA Logo and Branding */}
          <div className="flex items-center space-x-4">
            <RSALogo />
            <div className="hidden sm:block border-l border-gray-300 pl-4">
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
          </div>
          
          {/* Navigation/Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <span>Commercial Insurance</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>AI Innovation</span>
            </div>
            
            {/* RSA Brand Badge */}
            <div className="bg-rsa-light-blue text-rsa-blue px-3 py-1 rounded-full text-xs font-medium">
              Enterprise Platform
            </div>
          </div>
        </div>
        
        {/* Mobile title */}
        <div className="sm:hidden pb-3">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}