import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';
import { RepairType } from '../types/offer';
import { useOffers } from '../hooks/useOffers';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface Offer {
  Id_devis: number;
  description: string;
  Date: string;
  Id_user: number;
  type_reparation?: RepairType;
  prix?: string;
  adresse_facturation?: string;
  Code_postal?: string;
  nom_utilisateur?: string;
  status?: 'en_attente' | 'pris_en_charge' | 'terminé';
}

export function ProfessionalDashboard() {
  const [success, setSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const userId = localStorage.getItem('userId');

  // Utiliser le hook personnalisé avec cache
  const { offers, loading, error, refresh } = useOffers({
    cacheKey: 'professional_offers',
    cacheExpiration: 5 * 60 * 1000, // 5 minutes
    autoFetch: true
  });

  const handleTakeCharge = async (offerId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/offers/${offerId}/take-charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professionalId: userId
        })
      });

      if (response.ok) {
        setSuccess('Vous avez pris en charge cette demande avec succès !');
        // Recharger les offres pour mettre à jour leur statut (forcer le rafraîchissement)
        refresh();
      } else {
        setSubmitError('Une erreur est survenue lors de la prise en charge de la demande');
      }
    } catch (err) {
      setSubmitError('Erreur de connexion au serveur');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fixup-white to-fixup-blue/10 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-fixup-black mb-8 text-center">Demandes de réparation disponibles</h1>

        {loading && <LoadingSpinner message="Chargement des demandes..." />}
        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg shadow-sm">
            {error}
          </div>
        )}
        {submitError && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg shadow-sm">
            {submitError}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 text-sm text-fixup-green bg-fixup-green/10 rounded-lg shadow-sm">
            {success}
          </div>
        )}

        {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <div key={offer.Id_devis} className="bg-white rounded-xl shadow-lg overflow-hidden border border-fixup-blue/20">
              {/* Image de la catégorie */}
              <div className="h-48 bg-fixup-white relative">
                {offer.type_reparation === 'exterieur' && (
                  <img 
                    src="/images/categories/exterieur.jpg" 
                    alt="Travaux extérieurs"
                    className="w-full h-full object-cover"
                  />
                )}
                {offer.type_reparation === 'informatique' && (
                  <img 
                    src="/images/categories/informatique.jpg"
                    alt="Réparation informatique"
                    className="w-full h-full object-cover"
                  />
                )}
                {offer.type_reparation === 'electronique' && (
                  <img 
                    src="/images/categories/electronique.jpg"
                    alt="Réparation électronique"
                    className="w-full h-full object-cover"
                  />
                )}
                {offer.type_reparation === 'bois' && (
                  <img 
                    src="/images/categories/bois.jpg"
                    alt="Travaux bois"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-0 right-0 mt-3 mr-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-fixup-green/10 text-fixup-green shadow-sm">
                    {offer.prix ? `${offer.prix}€` : 'Prix non défini'}
                  </span>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-fixup-black">
                    {offer.type_reparation ? 
                      offer.type_reparation.charAt(0).toUpperCase() + offer.type_reparation.slice(1)
                      : 'Type non spécifié'
                    }
                  </h3>
                  <span className="text-sm text-fixup-black/70">
                    Par {offer.nom_utilisateur}
                  </span>
                </div>
                <p className="text-base text-fixup-black/70 mb-4">
                  {offer.description || 'Aucune description'}
                </p>
                <div className="flex items-center justify-between text-sm text-fixup-black mb-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{offer.Code_postal || 'Code postal non spécifié'}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{new Date(offer.Date).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                {offer.status === 'en_attente' ? (
                  <button
                    onClick={() => handleTakeCharge(offer.Id_devis)}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-fixup-blue hover:bg-fixup-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fixup-blue transition-colors duration-200"
                  >
                    Prendre en charge
                  </button>
                ) : (
                  <div className="text-center py-2 text-sm text-fixup-green">
                    Demande déjà prise en charge
                  </div>
                )}
              </div>
            </div>
          ))}
          {offers.length === 0 && (
            <div className="col-span-full text-center text-fixup-blue py-12 bg-white rounded-xl shadow-sm border border-fixup-blue/20">
              Aucune demande de réparation disponible
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
} 