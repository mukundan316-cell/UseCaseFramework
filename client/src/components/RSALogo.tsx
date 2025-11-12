import React from 'react';

const RSALogo = () => (
  <div className="flex items-center">
    <svg
      width="180"
      height="60"
      viewBox="0 0 180 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-2"
    >
      {/* Hexaware Official Logo - Wordmark Only (Q1 2024 Brand Guidelines) */}
      <g>
        {/* Hexaware Wordmark */}
        <text 
          x="10" 
          y="32" 
          fill="#3C2CDA" 
          fontSize="28" 
          fontWeight="600" 
          fontFamily="Manrope, Helvetica Neue, Arial, sans-serif"
          letterSpacing="-0.02em"
        >
          Hexaware
        </text>
        
        {/* Brand Tagline */}
        <text 
          x="10" 
          y="48" 
          fill="#8088A7" 
          fontSize="10" 
          fontWeight="400"
          fontFamily="Manrope, Helvetica Neue, Arial, sans-serif"
          letterSpacing="0.02em"
        >
          Digital Transformation Partner
        </text>
      </g>
    </svg>
  </div>
);

export default RSALogo;
