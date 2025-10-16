import React from 'react';
import logo from '../assets/logo_MDSU-M2_ORANGE-13.svg';


export function Logo({ className = '', size = 'normal' }: { className?: string; size?: 'normal' | 'large' }) {
  const dimensions = size === 'large' ? 'h-64 w-auto' : 'h-8 w-auto';


  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={logo}
        alt="FixUp logo"
        className={dimensions}
      />
    </div>
  );
}
