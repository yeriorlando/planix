import React from 'react';

interface PlatformLogoProps {
  variant?: 'normal' | 'large';
  className?: string;
}

export default function PlatformLogo({ variant = 'normal', className = '' }: PlatformLogoProps) {
  const sizeClass = className ? '' : (variant === 'large' ? 'h-16' : 'h-12');
  return (
    <img 
      src="/Logo-login-y-landing.webp" 
      alt="Planix" 
      className={`${sizeClass} ${className} w-auto object-contain dark:brightness-125`} 
    />
  );
}
