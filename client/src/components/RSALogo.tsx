import React from 'react';

const RSALogo = () => (
  <div className="flex items-center">
    <svg
      width="120"
      height="60"
      viewBox="0 0 120 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-2"
    >
      {/* RSA Sunburst Logo */}
      <g>
        {/* Sunburst rays */}
        <g transform="translate(90, 30)">
          {Array.from({ length: 24 }, (_, i) => {
            const angle = (i * 15) * Math.PI / 180;
            const x1 = Math.cos(angle) * 8;
            const y1 = Math.sin(angle) * 8;
            const x2 = Math.cos(angle) * 12;
            const y2 = Math.sin(angle) * 12;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#9F4F96"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          })}
        </g>
        
        {/* Center circle */}
        <circle cx="90" cy="30" r="4" fill="#9F4F96" />
        
        {/* RSA Text */}
        <text x="8" y="35" fill="#6B7280" fontSize="24" fontWeight="bold" fontFamily="Source Sans Pro, sans-serif">
          RSA
        </text>
        
        {/* "an [intact] company" text */}
        <text x="8" y="48" fill="#6B7280" fontSize="10" fontFamily="Source Sans Pro, sans-serif">
          an 
        </text>
        <text x="22" y="48" fill="#DC2626" fontSize="10" fontFamily="Source Sans Pro, sans-serif">
          [intact]
        </text>
        <text x="52" y="48" fill="#6B7280" fontSize="10" fontFamily="Source Sans Pro, sans-serif">
          company
        </text>
      </g>
    </svg>
  </div>
);

export default RSALogo;