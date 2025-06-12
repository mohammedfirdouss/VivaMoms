
import React from 'react';

interface PregnantMomIconProps {
  className?: string;
}

const PregnantMomIcon = ({ className = "h-12 w-12" }: PregnantMomIconProps) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Head */}
      <circle cx="50" cy="25" r="12" fill="currentColor" />
      
      {/* Body */}
      <ellipse cx="50" cy="55" rx="18" ry="25" fill="currentColor" />
      
      {/* Pregnant belly */}
      <ellipse cx="50" cy="62" rx="15" ry="18" fill="currentColor" opacity="0.8" />
      
      {/* Arms */}
      <ellipse cx="32" cy="45" rx="6" ry="15" fill="currentColor" transform="rotate(-20 32 45)" />
      <ellipse cx="68" cy="45" rx="6" ry="15" fill="currentColor" transform="rotate(20 68 45)" />
      
      {/* Heart symbol on belly */}
      <path
        d="M45 58 C45 55, 47 54, 50 57 C53 54, 55 55, 55 58 C55 62, 50 66, 50 66 C50 66, 45 62, 45 58 Z"
        fill="white"
        opacity="0.9"
      />
    </svg>
  );
};

export default PregnantMomIcon;
