import React from 'react';

export function LatestRequests() {
  const requests = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1581141849291-1125c7b692b5?auto=format&fit=crop&q=80&w=500&h=300",
      title: "Rénovation salle de bain",
      location: "Paris 11e",
      date: "Il y a 2 jours"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=500&h=300",
      title: "Installation cuisine",
      location: "Lyon 3e",
      date: "Il y a 3 jours"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80&w=500&h=300",
      title: "Peinture salon",
      location: "Marseille 8e",
      date: "Il y a 4 jours"
    }
  ];

  return (
    <div className="relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-fixup-black mb-16 flex flex-col sm:flex-row items-center justify-center max-w-xs sm:max-w-none mx-auto">
            <span>Dernières</span>
            <span className="block sm:hidden h-2"></span>
            <div className="relative mx-1 -mt-2">
              <div className="transform -rotate-6">
                <span className="absolute inset-x-1 inset-y-0 bg-[#f25C05] -z-10 rounded"></span>
                <span className="relative z-10 inline-block px-2 text-white">demandes</span>
              </div>
            </div>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
              <div className="relative h-48">
                <img 
                  src={request.image} 
                  alt={request.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-fixup-black mb-2">{request.title}</h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{request.location}</span>
                  <span>{request.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="inline-flex items-center px-6 py-3 border-2 border-fixup-green text-fixup-black font-medium rounded-lg hover:bg-fixup-green hover:text-white transition-colors duration-200">
            Voir toutes les demandes
          </button>
        </div>
      </div>
    </div>
  );
}