import React from 'react';
import { Search, MessageCircle, Calendar, Star } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: <Search className="w-8 h-8" />,
      number: 1,
      title: "Recherchez",
      description: ["Trouvez l'artisan idéal", "pour votre projet"]
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      number: 2,
      title: "Contactez",
      description: ["Échangez directement", "avec les artisans"]
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      number: 3,
      title: "Planifiez",
      description: ["Organisez votre projet", "en toute simplicité"]
    },
    {
      icon: <Star className="w-8 h-8" />,
      number: 4,
      title: "Profitez",
      description: ["Appréciez un", "travail bien fait"]
    }
  ];

  return (
    <div className="py-32 px-4 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-fixup-black flex flex-col sm:flex-row items-center justify-center max-w-xs sm:max-w-none mx-auto">
            <div className="relative mx-1">
              <div className="transform -rotate-6">
                <span className="absolute inset-0 bg-[#f25C05] -z-10 rounded"></span>
                <span className="relative z-10 inline-block px-4 text-white">Comment</span>
              </div>
            </div>
            <span>ça marche&nbsp;?</span>
          </h2>
        </div>

        {/* Desktop version */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2">
              <div className="absolute top-0 left-0 h-full w-full bg-fixup-orange transform origin-left scale-x-0 transition-transform duration-1000" />
              {/* Arrows between steps */}
              <div className="absolute top-[52%] left-[21%] text-fixup-orange text-lg font-bold -translate-y-1/2">{'>'}</div>
              <div className="absolute top-[52%] left-[47%] text-fixup-orange text-lg font-bold -translate-y-1/2">{'>'}</div>
              <div className="absolute top-[52%] left-[73%] text-fixup-orange text-lg font-bold -translate-y-1/2">{'>'}</div>

            </div>

            {/* Steps */}
            <div className="grid grid-cols-4 gap-8 relative">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-400">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#f25C05] text-white flex items-center justify-center text-sm font-bold z-20">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-fixup-black text-center">
                    {step.title}
                  </h3>
                  <div className="text-gray-600 text-center text-sm">
                    {step.description.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile version */}
        <div className="md:hidden space-y-12">
          {steps.map((step, index) => (
            <div key={index} className="relative flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-400">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#f25C05] text-white flex items-center justify-center text-sm font-bold z-20">
                    {step.number}
                  </div>
                </div>
              </div>
              <div className="flex-grow pt-2">
                <h3 className="text-lg font-semibold mb-1 text-fixup-black">
                  {step.title}
                </h3>
                <div className="text-gray-600 text-sm">
                  {step.description.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="absolute top-16 left-8 w-0.5 h-12 bg-fixup-orange" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}