import React from 'react';

interface MedalStarProps {
  size?: number;
  className?: string;
}

export default function MedalStar({ size = 18, className = "" }: MedalStarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L14.81 8.62L22 9.24L16.55 13.97L18.18 21L12 17.27L5.82 21L7.45 13.97L2 9.24L9.19 8.62L12 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
