import React from 'react';
import { Wrench, Hammer, Ruler, HardDrive } from 'lucide-react';

export function BackgroundShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top row - aligned with text */}
      <div className="absolute top-[35%] left-[15%] text-gray-400 animate-wrench">
        <Wrench className="w-32 h-32" />
      </div>
      <div className="absolute top-[35%] right-[15%] text-gray-400 animate-hammer">
        <Hammer className="w-32 h-32" />
      </div>

      {/* Bottom row - more spread out */}
      <div className="absolute bottom-[20%] left-[5%] text-gray-400 animate-ruler">
        <Ruler className="w-32 h-32" />
      </div>
      <div className="absolute bottom-[20%] right-[5%] text-gray-400 animate-screwdriver">
        <HardDrive className="w-32 h-32" />
      </div>
    </div>
  );
}