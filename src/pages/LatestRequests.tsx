import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

interface LatestOffer {
  Id_devis: number;
  description: string;
  Date: string;
  Code_postal?: string;
  adresse_facturation?: string;
  type_reparation?: string;
  prix?: string;
  Prenom?: string;
  Nom?: string;
}

const getCategoryImage = (type?: string) => {
  const images: Record<string, string> = {
    'exterieur': 'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?auto=format&fit=crop&q=80&w=500&h=300',
    'informatique': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=500&h=300',
    'electronique': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=500&h=300',
    'bois': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80&w=500&h=300',
  };
  return images[type || ''] || 'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?auto=format&fit=crop&q=80&w=500&h=300';
};

const getCategoryTitle = (type?: string) => {
  const names: Record<string, string> = {
    'exterieur': 'Travaux extérieurs',
    'informatique': 'Réparation informatique',
    'electronique': 'Réparation électronique',
    'bois': 'Travaux bois',
  };
  return names[type || ''] || 'Demande de réparation';
};

export function LatestRequests() {
  const [requests, setRequests] = useState<LatestOffer[]>([]);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/offers`);
        if (res.ok) {
          const data = await res.json();
          // Prendre les 3 dernières offres
          setRequests(data.slice(0, 3));
        }
      } catch (err) {
        console.error('Erreur chargement dernières demandes:', err);
      }
    };
    loadRequests();
  }, []);

  // Fallback si pas de données
  if (requests.length === 0) {
    return null;
  }

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
            <div key={request.Id_devis} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
              <div className="relative h-48">
                <img
                  src={getCategoryImage(request.type_reparation)}
                  alt={getCategoryTitle(request.type_reparation)}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-fixup-black mb-2">
                  {getCategoryTitle(request.type_reparation)}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{request.description}</p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{request.Code_postal || request.adresse_facturation || ''}</span>
                  <span>{new Date(request.Date).toLocaleDateString('fr-FR')}</span>
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