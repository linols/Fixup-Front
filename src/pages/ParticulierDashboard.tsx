import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, FileText, Calendar, MapPin, Euro, User, Clock, Search } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { RepairType, OfferFormData } from '../types/offer';
import { useOffers } from '../hooks/useOffers';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Interface pour les offres
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
  // Champs utilisateur complets
  Prenom?: string;
  Nom?: string;
  user_name?: string;
  user_email?: string;
  status?: string;
  // Image de l'offre
  Image?: string;
}

export function ParticulierDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'requests'>('overview');
  const [formData, setFormData] = useState<OfferFormData>({
    description: '',
    type_reparation: 'exterieur',
    photos: [], // Tableau de fichiers File[]
    adresse_facturation: '',
    Code_postal: '',
    prix: '',
    mode_paiement: 'CB'
  });

  const [success, setSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const userId = localStorage.getItem('userId');

  // Utiliser le hook personnalisé avec cache
  const { offers, loading, error, refresh } = useOffers({
    cacheKey: 'particulier_offers',
    cacheExpiration: 5 * 60 * 1000, // 5 minutes
    autoFetch: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        photos: files // Stocker les fichiers directement
      }));

      // Créer des aperçus d'images
      const previews: string[] = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            previews.push(e.target.result as string);
            if (previews.length === files.length) {
              setImagePreviews(previews);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSuccess('');

    try {
      // Créer FormData (pas JSON !)
      const formDataToSend = new FormData();
      formDataToSend.append('description', formData.description);
      formDataToSend.append('idUtilisateur', userId || '');
      formDataToSend.append('Code_postal', formData.Code_postal);
      formDataToSend.append('adresse_facturation', formData.adresse_facturation);
      formDataToSend.append('Date', new Date().toISOString().split('T')[0]);
      formDataToSend.append('prix', formData.prix);
      formDataToSend.append('mode_paiement', formData.mode_paiement);
      formDataToSend.append('type_reparation', formData.type_reparation);

      // Ajouter le fichier image
      if (formData.photos && formData.photos.length > 0) {
        formDataToSend.append('image', formData.photos[0]); // Le champ doit s'appeler 'image'
      }

      const response = await fetch(`${API_BASE_URL}/api/offers`, {
        method: 'POST',
        // Pas de Content-Type, le navigateur gère multipart/form-data
        body: formDataToSend
      });

      if (response.ok) {
        setSuccess('Votre demande a été créée avec succès !');
        setFormData({
          description: '',
          type_reparation: 'exterieur',
          photos: [], // Réinitialiser le tableau de fichiers
          adresse_facturation: '',
          Code_postal: '',
          prix: '',
          mode_paiement: 'CB'
        });
        setImagePreviews([]);
        // Recharger les offres (forcer le rafraîchissement)
        refresh();
        setActiveTab('requests');
      } else {
        setSubmitError('Une erreur est survenue lors de la création de la demande');
      }
    } catch (err) {
      setSubmitError('Erreur de connexion au serveur');
      console.error(err);
    }
  };

  const getCategoryImage = (type: string) => {
    const images = {
      'exterieur': '/images/categories/exterieur.jpg',
      'informatique': '/images/categories/informatique.jpg',
      'electronique': '/images/categories/electronique.jpg',
      'bois': '/images/categories/bois.jpg'
    };
    return images[type as keyof typeof images] || '/images/categories/exterieur.jpg';
  };

  const getCategoryName = (type: string) => {
    const names = {
      'exterieur': 'Extérieur',
      'informatique': 'Informatique',
      'electronique': 'Électronique',
      'bois': 'Bois'
    };
    return names[type as keyof typeof names] || type;
  };

  // Fonction pour obtenir le nom complet de l'utilisateur
  const getUserDisplayName = (offer: Offer) => {
    // Priorité 1: Prenom + Nom
    if (offer.Prenom && offer.Nom) {
      return `${offer.Prenom} ${offer.Nom}`;
    }
    // Priorité 2: user_name
    if (offer.user_name && offer.user_name !== 'Utilisateur inconnu') {
      return offer.user_name;
    }
    // Priorité 3: nom_utilisateur
    if (offer.nom_utilisateur && offer.nom_utilisateur !== 'Utilisateur anonyme') {
      return offer.nom_utilisateur;
    }
    // Fallback
    return 'Utilisateur inconnu';
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'en attente':
        return 'bg-fixup-orange/10 text-fixup-orange border-fixup-orange/20';
      case 'accepté':
      case 'accepte':
        return 'bg-fixup-green/10 text-fixup-green border-fixup-green/20';
      case 'refusé':
      case 'refuse':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'terminé':
      case 'termine':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Fonction pour obtenir l'URL de l'image (stockée en BLOB)
  const getImageUrl = (offer: Offer) => {
    if (offer.Image) {
      // L'image est stockée en BLOB dans la base de données
      // Le backend la sert via cet endpoint
      return `${API_BASE_URL}/api/offers/${offer.Id_devis}/image`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fixup-white to-fixup-blue/10 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-fixup-black mb-4">
            Espace Particulier
          </h1>
          <p className="text-xl text-fixup-black/70 max-w-2xl mx-auto">
            Gérez vos demandes de réparation et trouvez les meilleurs artisans
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2 border border-fixup-blue/20">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'overview'
                    ? 'bg-fixup-blue text-white shadow-md'
                    : 'text-fixup-black hover:bg-fixup-blue/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Vue d'ensemble</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'create'
                    ? 'bg-fixup-blue text-white shadow-md'
                    : 'text-fixup-black hover:bg-fixup-blue/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Créer une demande</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'requests'
                    ? 'bg-fixup-blue text-white shadow-md'
                    : 'text-fixup-black hover:bg-fixup-blue/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Mes demandes</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {loading && <LoadingSpinner message="Chargement des données..." />}
            {error && (
              <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-lg shadow-sm">
                {error}
              </div>
            )}
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-fixup-blue/20">
                <div className="flex items-center">
                  <div className="p-3 bg-fixup-green/10 rounded-lg">
                    <FileText className="w-6 h-6 text-fixup-green" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-fixup-black/70">Total des demandes</p>
                    <p className="text-2xl font-bold text-fixup-black">{offers.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-fixup-blue/20">
                <div className="flex items-center">
                  <div className="p-3 bg-fixup-orange/10 rounded-lg">
                    <Clock className="w-6 h-6 text-fixup-orange" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-fixup-black/70">En attente</p>
                    <p className="text-2xl font-bold text-fixup-black">{offers.filter(o => o.status === 'En attente').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-fixup-blue/20">
                <div className="flex items-center">
                  <div className="p-3 bg-fixup-blue/10 rounded-lg">
                    <Euro className="w-6 h-6 text-fixup-blue" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-fixup-black/70">Budget moyen</p>
                    <p className="text-2xl font-bold text-fixup-black">
                      {offers.length > 0
                        ? Math.round(offers.reduce((sum, o) => sum + parseInt(o.prix || '0'), 0) / offers.length)
                        : 0
                      }€
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-fixup-blue/20">
              <h2 className="text-2xl font-bold text-fixup-black mb-6">Actions rapides</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setActiveTab('create')}
                  className="p-6 bg-gradient-to-r from-fixup-green to-fixup-orange rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-4">
                    <Plus className="w-8 h-8" />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">Créer une nouvelle demande</h3>
                      <p className="text-white/80">Décrivez votre problème et trouvez un artisan</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="p-6 bg-gradient-to-r from-fixup-blue to-fixup-green rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-4">
                    <Eye className="w-8 h-8" />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">Voir mes demandes</h3>
                      <p className="text-white/80">Consultez l'état de vos demandes</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/trouver-artisan')}
                  className="p-6 bg-gradient-to-r from-fixup-orange to-fixup-green rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 md:col-span-2"
                >
                  <div className="flex items-center space-x-4">
                    <Search className="w-8 h-8" />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">Trouver un artisan</h3>
                      <p className="text-white/80">Recherchez un artisan près de chez vous</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Dernières demandes */}
            {offers.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8 border border-fixup-blue/20">
                <h2 className="text-2xl font-bold text-fixup-black mb-6">Dernières demandes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {offers.slice(0, 3).map((offer) => {
                    const imageUrl = getImageUrl(offer);
                    return (
                      <div key={offer.Id_devis} className="bg-fixup-white rounded-lg shadow-md overflow-hidden border border-fixup-blue/20 hover:shadow-lg transition-shadow duration-200">
                        <div className="h-32 bg-cover bg-center" style={{
                          backgroundImage: `url(${imageUrl || getCategoryImage(offer.type_reparation || 'exterieur')})`
                        }}>
                          <div className="h-full bg-black/20 flex items-end">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-fixup-green/90 text-white m-3">
                              {offer.prix ? `${offer.prix}€` : 'Prix non défini'}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-fixup-black">
                              {getCategoryName(offer.type_reparation || 'exterieur')}
                            </h3>
                            <div className="text-right">
                              <div className="text-sm font-bold text-fixup-green">
                                {offer.prix && offer.prix !== '0' ? `${offer.prix}€` : 'Prix N/A'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-fixup-black/70 mb-2">
                            <User className="w-3 h-3 mr-1" />
                            <span>{getUserDisplayName(offer)}</span>
                          </div>
                          <p className="text-sm text-fixup-black/70 mb-3 line-clamp-2">
                            {offer.description || 'Aucune description'}
                          </p>
                          <div className="flex items-center justify-between text-xs text-fixup-black/60 mb-2">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>{offer.Code_postal || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>{new Date(offer.Date).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          {offer.status && (
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(offer.status)}`}>
                                {offer.status}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Créer une demande */}
        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-fixup-blue/20">
              <h2 className="text-3xl font-bold text-fixup-black mb-8 text-center">Créer une nouvelle demande</h2>

              {submitError && (
                <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-lg shadow-sm">
                  {submitError}
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 text-sm text-fixup-green bg-fixup-green/10 rounded-lg shadow-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="type_reparation" className="block text-sm font-medium text-fixup-black mb-2">
                      Type de réparation
                    </label>
                    <select
                      id="type_reparation"
                      name="type_reparation"
                      value={formData.type_reparation}
                      onChange={handleInputChange}
                      className="w-full pl-3 pr-10 py-3 text-base border border-fixup-blue/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-fixup-orange focus:border-fixup-orange"
                    >
                      <option value="exterieur">Extérieur</option>
                      <option value="informatique">Informatique</option>
                      <option value="electronique">Électronique</option>
                      <option value="bois">Bois</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="prix" className="block text-sm font-medium text-fixup-black mb-2">
                      Budget estimé (€)
                    </label>
                    <input
                      type="number"
                      id="prix"
                      name="prix"
                      value={formData.prix}
                      onChange={handleInputChange}
                      className="w-full border border-fixup-blue/20 rounded-lg py-3 px-3 focus:outline-none focus:ring-2 focus:ring-fixup-orange focus:border-fixup-orange"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-fixup-black mb-2">
                    Description du problème
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full border border-fixup-blue/20 rounded-lg py-3 px-3 focus:outline-none focus:ring-2 focus:ring-fixup-orange focus:border-fixup-orange"
                    placeholder="Décrivez votre problème en détail..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="photos" className="block text-sm font-medium text-fixup-black mb-2">
                    Photos (optionnel) {formData.photos.length > 0 && `(${formData.photos.length} sélectionnée${formData.photos.length > 1 ? 's' : ''})`}
                  </label>
                  <p className="text-xs text-fixup-black/60 mb-2">
                    Les images seront stockées en BLOB dans la base de données
                  </p>
                  <input
                    type="file"
                    id="photos"
                    name="photos"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-fixup-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-fixup-blue/10 file:text-fixup-blue hover:file:bg-fixup-blue/20"
                  />

                  {/* Aperçu des images */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-fixup-black mb-2">Aperçu des images :</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Aperçu ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-fixup-blue/20"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newPreviews = imagePreviews.filter((_, i) => i !== index);
                                setImagePreviews(newPreviews);
                                const newPhotos = formData.photos.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, photos: newPhotos }));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="adresse_facturation" className="block text-sm font-medium text-fixup-black mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      id="adresse_facturation"
                      name="adresse_facturation"
                      value={formData.adresse_facturation}
                      onChange={handleInputChange}
                      className="w-full border border-fixup-blue/20 rounded-lg py-3 px-3 focus:outline-none focus:ring-2 focus:ring-fixup-orange focus:border-fixup-orange"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="Code_postal" className="block text-sm font-medium text-fixup-black mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      id="Code_postal"
                      name="Code_postal"
                      value={formData.Code_postal}
                      onChange={handleInputChange}
                      className="w-full border border-fixup-blue/20 rounded-lg py-3 px-3 focus:outline-none focus:ring-2 focus:ring-fixup-orange focus:border-fixup-orange"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <button
                    type="submit"
                    className="px-8 py-4 bg-fixup-blue text-white font-semibold rounded-lg hover:bg-fixup-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fixup-blue transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Plus className="w-5 h-5" />
                      <span>Créer la demande</span>
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Mes demandes */}
        {activeTab === 'requests' && (
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8 border border-fixup-blue/20">
              <h2 className="text-3xl font-bold text-fixup-black mb-8 text-center">Mes demandes de réparation</h2>

              {loading ? (
                <LoadingSpinner message="Chargement des demandes..." />
              ) : offers.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-fixup-blue/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-fixup-black mb-2">Aucune demande pour le moment</h3>
                  <p className="text-fixup-black/70 mb-6">Créez votre première demande de réparation</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-6 py-3 bg-fixup-blue text-white font-medium rounded-lg hover:bg-fixup-blue/90 transition-colors duration-200"
                  >
                    Créer une demande
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {offers.map((offer) => {
                    const imageUrl = getImageUrl(offer);
                    return (
                      <div key={offer.Id_devis} className="bg-fixup-white rounded-xl shadow-lg overflow-hidden border border-fixup-blue/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="h-48 bg-cover bg-center relative" style={{
                          backgroundImage: `url(${imageUrl || getCategoryImage(offer.type_reparation || 'exterieur')})`
                        }}>
                          <div className="absolute top-0 right-0 mt-3 mr-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-fixup-green/90 text-white shadow-sm">
                              {offer.prix ? `${offer.prix}€` : 'Prix non défini'}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-semibold text-fixup-black">
                              {getCategoryName(offer.type_reparation || 'exterieur')}
                            </h3>
                            <div className="text-right">
                              <div className="flex items-center text-sm text-fixup-black/70 mb-1">
                                <User className="w-4 h-4 mr-1" />
                                <span>{getUserDisplayName(offer)}</span>
                              </div>
                              <div className="text-lg font-bold text-fixup-green">
                                {offer.prix && offer.prix !== '0' ? `${offer.prix}€` : 'Prix non défini'}
                              </div>
                            </div>
                          </div>

                          <p className="text-base text-fixup-black/70 mb-4 line-clamp-2">
                            {offer.description || 'Aucune description'}
                          </p>

                          <div className="flex items-center justify-between text-sm text-fixup-black mb-3">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{offer.Code_postal || 'Code postal non spécifié'}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>{new Date(offer.Date).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>

                          {offer.status && (
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(offer.status)}`}>
                                {offer.status}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
