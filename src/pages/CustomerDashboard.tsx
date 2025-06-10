import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { RepairType, OfferFormData } from '../types/offer';

// Mise à jour du type Offer pour correspondre aux données de l'API
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
}

export function CustomerDashboard() {
  const [formData, setFormData] = useState<OfferFormData>({
    description: '',
    type_reparation: 'exterieur',
    photos: [],
    adresse_facturation: '',
    Code_postal: '',
    prix: '',
    mode_paiement: 'CB'
  });

  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const userId = localStorage.getItem('userId');

  // Charger les offres existantes
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/offers`);
        if (response.ok) {
          const data = await response.json();
          // Vérifier et nettoyer les données
          const validOffers = data.map((offer: any) => ({
            ...offer,
            // Valeurs par défaut pour les champs optionnels
            type_reparation: offer.type_reparation || 'exterieur',
            prix: offer.prix || '0',
            adresse_facturation: offer.adresse_facturation || '',
            Code_postal: offer.Code_postal || '',
            nom_utilisateur: offer.nom_utilisateur || 'Utilisateur anonyme'
          }));
          setOffers(validOffers);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des offres:', err);
        setError('Impossible de charger les demandes de réparation');
      }
    };

    fetchOffers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        photos: Array.from(e.target.files || [])
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const offerData = {
        description: formData.description,
        idUtilisateur: userId,
        Code_postal: formData.Code_postal,
        adresse_facturation: formData.adresse_facturation,
        Date: new Date().toISOString().split('T')[0],
        prix: formData.prix,
        mode_paiement: formData.mode_paiement,
        type_reparation: formData.type_reparation
      };

      const response = await fetch(`${API_BASE_URL}/api/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerData)
      });

      if (response.ok) {
        setSuccess('Votre demande a été créée avec succès !');
        // Réinitialiser le formulaire
        setFormData({
          description: '',
          type_reparation: 'exterieur',
          photos: [],
          adresse_facturation: '',
          Code_postal: '',
          prix: '',
          mode_paiement: 'CB'
        });
        // Recharger les offres
        const updatedResponse = await fetch(`${API_BASE_URL}/api/offers`);
        const updatedOffers = await updatedResponse.json();
        setOffers(updatedOffers);
      } else {
        setError('Une erreur est survenue lors de la création de la demande');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fixup-white to-fixup-blue/10 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-fixup-black mb-8 text-center">Dernières demandes de réparation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {offers.map((offer) => (
                <div key={offer.Id_devis} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-fixup-blue/20">
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
                    <p className="text-base text-fixup-black/70 mb-4 line-clamp-2">
                      {offer.description || 'Aucune description'}
                    </p>
                    <div className="flex items-center justify-between text-sm text-fixup-black">
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
                  </div>
                </div>
              ))}
              {offers.length === 0 && (
                <div className="col-span-full text-center text-fixup-blue py-12 bg-white rounded-xl shadow-sm border border-fixup-blue/20">
                  Aucune demande de réparation pour le moment
                </div>
              )}
            </div>
          </div>

          <h1 className="text-4xl font-bold text-fixup-black mb-8 text-center">Créer une demande de réparation</h1>

          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg shadow-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 text-sm text-fixup-green bg-fixup-green/10 rounded-lg shadow-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 mb-8 border border-fixup-blue/20">
            <div className="space-y-6">
              <div>
                <label htmlFor="type_reparation" className="block text-sm font-medium text-fixup-black">
                  Type de réparation
                </label>
                <select
                  id="type_reparation"
                  name="type_reparation"
                  value={formData.type_reparation}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-fixup-blue/20 focus:outline-none focus:ring-fixup-orange focus:border-fixup-orange sm:text-sm rounded-lg"
                >
                  <option value="exterieur">Extérieur</option>
                  <option value="informatique">Informatique</option>
                  <option value="electronique">Électronique</option>
                  <option value="bois">Bois</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-fixup-black">
                  Description du problème
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-fixup-blue/20 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-fixup-orange focus:border-fixup-orange sm:text-sm"
                  placeholder="Décrivez votre problème en détail..."
                  required
                />
              </div>

              <div>
                <label htmlFor="photos" className="block text-sm font-medium text-fixup-black">
                  Photos
                </label>
                <input
                  type="file"
                  id="photos"
                  name="photos"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-fixup-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
              </div>

              <div>
                <label htmlFor="adresse_facturation" className="block text-sm font-medium text-fixup-black">
                  Adresse
                </label>
                <input
                  type="text"
                  id="adresse_facturation"
                  name="adresse_facturation"
                  value={formData.adresse_facturation}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-fixup-blue/20 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-fixup-orange focus:border-fixup-orange sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="Code_postal" className="block text-sm font-medium text-fixup-black">
                  Code postal
                </label>
                <input
                  type="text"
                  id="Code_postal"
                  name="Code_postal"
                  value={formData.Code_postal}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-fixup-blue/20 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-fixup-orange focus:border-fixup-orange sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="prix" className="block text-sm font-medium text-fixup-black">
                  Budget estimé (€)
                </label>
                <input
                  type="number"
                  id="prix"
                  name="prix"
                  value={formData.prix}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-fixup-blue/20 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-fixup-orange focus:border-fixup-orange sm:text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-fixup-blue hover:bg-fixup-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fixup-blue transition-colors duration-200"
              >
                Créer la demande
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 