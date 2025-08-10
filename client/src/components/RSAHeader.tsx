import React from 'react';

const RSALogo = () => (
  <div className="flex items-center space-x-3">
    {/* Authentic RSA Logo */}
    <div className="flex items-center space-x-3">
      {/* RSA Text */}
      <div className="text-3xl font-bold text-[#666666] tracking-wide">
        RSA
      </div>
      
      {/* RSA Authentic Purple Sunburst Icon */}
      <div className="relative w-10 h-10">
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10"
        >
          {/* Outer sunburst rays - authentic RSA style */}
          <g fill="#9F4F96">
            {/* Primary rays at cardinal and diagonal directions */}
            <rect x="19" y="1" width="2" height="8" rx="1"/>
            <rect x="19" y="31" width="2" height="8" rx="1"/>
            <rect x="1" y="19" width="8" height="2" rx="1"/>
            <rect x="31" y="19" width="8" height="2" rx="1"/>
            
            <rect x="28.5" y="6.9" width="2" height="8" rx="1" transform="rotate(45 28.5 6.9)"/>
            <rect x="5.8" y="29.4" width="2" height="8" rx="1" transform="rotate(45 5.8 29.4)"/>
            <rect x="6.9" y="5.8" width="2" height="8" rx="1" transform="rotate(-45 6.9 5.8)"/>
            <rect x="29.4" y="28.5" width="2" height="8" rx="1" transform="rotate(-45 29.4 28.5)"/>
            
            {/* Secondary rays - authentic RSA sunburst pattern */}
            <rect x="30.2" y="9.8" width="1.5" height="6" rx="0.75" transform="rotate(22.5 30.2 9.8)"/>
            <rect x="8.3" y="32.7" width="1.5" height="6" rx="0.75" transform="rotate(22.5 8.3 32.7)"/>
            <rect x="9.8" y="8.3" width="1.5" height="6" rx="0.75" transform="rotate(-22.5 9.8 8.3)"/>
            <rect x="32.7" y="30.2" width="1.5" height="6" rx="0.75" transform="rotate(-22.5 32.7 30.2)"/>
            
            <rect x="32.7" y="9.8" width="1.5" height="6" rx="0.75" transform="rotate(67.5 32.7 9.8)"/>
            <rect x="10.8" y="32.2" width="1.5" height="6" rx="0.75" transform="rotate(67.5 10.8 32.2)"/>
            <rect x="7.3" y="10.8" width="1.5" height="6" rx="0.75" transform="rotate(-67.5 7.3 10.8)"/>
            <rect x="29.2" y="32.7" width="1.5" height="6" rx="0.75" transform="rotate(-67.5 29.2 32.7)"/>
            
            {/* Additional fine rays for authentic look */}
            <rect x="19" y="3" width="2" height="5" rx="1"/>
            <rect x="19" y="32" width="2" height="5" rx="1"/>
            <rect x="3" y="19" width="5" height="2" rx="1"/>
            <rect x="32" y="19" width="5" height="2" rx="1"/>
          </g>
          
          {/* Central magenta/purple circle - authentic RSA color */}
          <circle cx="20" cy="20" r="8" fill="#E61E7A" stroke="#9F4F96" strokeWidth="1"/>
          <circle cx="20" cy="20" r="5" fill="#9F4F96"/>
          <circle cx="20" cy="20" r="2" fill="white"/>
        </svg>
      </div>
    </div>
    
    {/* "an [intact] company" tagline - authentic styling */}
    <div className="text-sm text-[#666666] hidden sm:block font-normal">
      an <span className="text-[#E61E7A] font-medium border border-[#E61E7A] px-1.5 py-0.5 text-xs">[intact]</span> company
    </div>
  </div>
);

interface RSAHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function RSAHeader({ 
  title = "RSA AI Use Case Value Framework", 
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