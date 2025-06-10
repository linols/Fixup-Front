import React from 'react';
import { MapPin, Leaf, PiggyBank } from 'lucide-react';

export function WhyChooseUs() {
  const benefits = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Local",
      description: ["Trouvez des artisans qualifiés", "près de chez vous"]
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Écologique",
      description: ["Nos artisans s'engagent pour des", "pratiques éco-responsables"]
    },
    {
      icon: <PiggyBank className="w-8 h-8" />,
      title: "Économique",
      description: ["Des tarifs transparents", "et compétitifs"]
    }
  ];

  return (
    <div className="relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-fixup-black mb-16 flex items-center justify-center">
            Pourquoi
            <div className="relative mx-2">
              <div className="transform -rotate-6">
                <span className="absolute inset-0 bg-[#f25C05] -z-10 rounded"></span>
                <span className="relative z-10 inline-block px-4 text-white">nous</span>
              </div>
            </div>
            choisir ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-gray-50 p-6 md:p-8 rounded-lg shadow-lg transform hover:-translate-y-2 transition-all duration-300 ease-in-out"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-6 text-fixup-green">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-fixup-black mb-4">
                    {benefit.title}
                  </h3>
                  <div className="text-gray-600 text-center leading-relaxed">
                    {benefit.description.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}