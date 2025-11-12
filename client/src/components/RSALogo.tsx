import React from 'react';

const RSALogo = () => (
  <div className="flex items-center">
    <svg
      width="140"
      height="60"
      viewBox="0 0 140 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-2"
    >
      {/* Hexaware Logo - Modern Hexagon Design */}
      <g>
        {/* Hexagon Icon */}
        <g transform="translate(8, 30)">
          {/* Outer Hexagon */}
          <path
            d="M 12,0 L 24,6.93 L 24,20.79 L 12,27.72 L 0,20.79 L 0,6.93 Z"
            fill="#005DAA"
            opacity="0.9"
          />
          {/* Inner Hexagon */}
          <path
            d="M 12,4 L 20,8.62 L 20,17.86 L 12,22.48 L 4,17.86 L 4,8.62 Z"
            fill="#9F4F96"
            opacity="0.8"
          />
          {/* Center dot */}
          <circle cx="12" cy="13.86" r="3" fill="#FFFFFF" />
        </g>
        
        {/* Hexaware Text */}
        <text x="44" y="25" fill="#2D3748" fontSize="22" fontWeight="700" fontFamily="Inter, sans-serif">
          Hexaware
        </text>
        
        {/* Tagline */}
        <text x="44" y="42" fill="#6B7280" fontSize="9" fontFamily="Inter, sans-serif">
          Digital Transformation Partner
        </text>
      </g>
    </svg>
  </div>
);

export default RSALogo;
