import React, { useEffect, useState } from 'react';
import { Wrench, Hammer, Ruler, HardDrive } from 'lucide-react';
import boulon from '../assets/boulon.png';
import boulon8 from '../assets/boulon8.png';
import boulon11 from '../assets/boulon11.png';
import boulon14 from '../assets/boulon14.png';

export function BackgroundShapes() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Boulon en haut à gauche */}
      <div className="absolute top-[35%] left-[15%]">
        <img src={boulon} alt="boulon" className="w-24 h-24 opacity-60 animate-wrench" style={{ filter: 'contrast(1.5) brightness(1.2) saturate(1.5) drop-shadow(0 0 16px #0006)' }} />
      </div>
      {/* Boulon11 en haut à droite */}
      <div className="absolute top-[35%] right-[15%]">
        <img src={boulon11} alt="boulon11" className="w-32 h-32 opacity-60 animate-hammer" style={{ filter: ' saturate(1.5) drop-shadow(0 0 16px #0006)' }} />
      </div>
      {/* Boulon8 en bas à gauche */}
      <div className="absolute bottom-[20%] left-[5%]">
        <img src={boulon8} alt="boulon8" className="w-32 h-32 opacity-60 animate-ruler"  />
      </div>
      {/* Boulon14 en bas à droite */}
      <div className="absolute bottom-[20%] right-[5%]">
        <img src={boulon14} alt="boulon14" className="w-40 h-40 opacity-60 animate-screwdriver" style={{ filter: 'contrast(1.5) brightness(1.2) saturate(1.5) drop-shadow(0 0 16px #0006)' }} />
      </div>
    </div>
  );
}