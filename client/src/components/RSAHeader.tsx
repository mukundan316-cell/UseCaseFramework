import React from 'react';
import RSALogo from './RSALogo';

interface RSAHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function RSAHeader({ 
  title = "RSA AI Use Case Value Framework", 
  subtitle = "AI Strategy & Prioritization Platform" 
}: RSAHeaderProps) {
  return (
    <header className="rsa-header sticky top-0 z-50 bg-gradient-to-r from-white via-blue-50/30 to-white border-b border-gray-200/50 shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* RSA Logo and Branding */}
          <div className="flex items-center space-x-6">
            <RSALogo />
            <div className="hidden sm:block border-l border-gray-300 pl-6">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent">{title}</h1>
              <p className="text-sm text-gray-600 font-medium">{subtitle}</p>
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
            <div className="bg-gradient-to-r from-rsa-purple via-blue-600 to-rsa-blue text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
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