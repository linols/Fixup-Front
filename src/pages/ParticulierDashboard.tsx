import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Calendar, MapPin, User, Search } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { fetchUserDemandes, postDemande } from '../services/api';
import type { Demande } from '../types/types';

interface DemandeFormData {
  titre: string;
  description: string;
  type_reparation: string;
  photos: File[];
  adresse: string;
}

export function ParticulierDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'requests'>('home');
  const [formData, setFormData] = useState<DemandeFormData>({
    titre: '',
    description: '',
    type_reparation: 'Produits électroniques',
    photos: [],
    adresse: '',
  });

  const [success, setSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const userId = localStorage.getItem('userId');

  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDemandes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserDemandes(userId);
      setDemandes(data);
    } catch (err) {
      console.error('Erreur chargement demandes:', err);
      setError('Impossible de charger vos demandes');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDemandes();
  }, [loadDemandes]);

  const refresh = useCallback(() => {
    loadDemandes();
  }, [loadDemandes]);

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
      const formDataToSend = new FormData();
      formDataToSend.append('id_user', userId || '');
      formDataToSend.append('titre', formData.titre);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type_reparation', formData.type_reparation);
      formDataToSend.append('adresse', formData.adresse);

      // Ajouter les fichiers images
      formData.photos.forEach(file => {
        formDataToSend.append('photos', file);
      });

      await postDemande(formDataToSend);

      setSuccess('Votre demande a été créée avec succès !');
      setFormData({
        titre: '',
        description: '',
        type_reparation: 'Produits électroniques',
        photos: [],
        adresse: '',
      });
      setImagePreviews([]);
      refresh();
      setActiveTab('requests');
    } catch (err) {
      setSubmitError('Une erreur est survenue lors de la création de la demande');
      console.error(err);
    }
  };

  const getCategoryImage = (type: string) => {
    const images = {
      'Produits électroniques': '/images/categories/electronique.jpg',
      'Gros électroménager': '/images/categories/bois.jpg',
      'Petit électroménager': '/images/categories/informatique.jpg',
      'exterieur': '/images/categories/exterieur.jpg',
      'informatique': '/images/categories/informatique.jpg',
      'electronique': '/images/categories/electronique.jpg',
      'bois': '/images/categories/bois.jpg'
    };
    return images[type as keyof typeof images] || '/images/categories/exterieur.jpg';
  };

  const getCategoryName = (type: string) => {
    const names = {
      'Produits électroniques': 'Produits électroniques',
      'Gros électroménager': 'Gros électroménager',
      'Petit électroménager': 'Petit électroménager',
      'exterieur': 'Extérieur',
      'informatique': 'Informatique',
      'electronique': 'Électronique',
      'bois': 'Bois'
    };
    return names[type as keyof typeof names] || type;
  };

  // Fonction pour obtenir le nom complet de l'artisan "assigné" (si existant)
  const getArtisanDisplayName = (demande: Demande) => {
    if (demande.artisan_Prenom && demande.artisan_Nom) {
      return `${demande.artisan_Prenom} ${demande.artisan_Nom}`;
    }
    return 'Artisan non assigné';
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

  // Fonction pour obtenir l'URL de l'image (si disponible)
  const getImageUrl = (demande: Demande) => {
    if (demande.first_photo_id) {
      return `${API_BASE_URL}/api/demandes/${demande.id}/photos/${demande.first_photo_id}`;
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
                onClick={() => setActiveTab('home')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'home'
                  ? 'bg-fixup-blue text-white shadow-md'
                  : 'text-fixup-black hover:bg-fixup-blue/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Trouver un artisan</span>
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

        {/* Accueil */}
        {activeTab === 'home' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-10 border border-fixup-blue/20 text-center">
              <div className="mb-8">
                <div className="p-4 bg-fixup-orange/10 rounded-full inline-flex mb-4">
                  <Search className="w-10 h-10 text-fixup-orange" />
                </div>
                <p className="text-lg text-fixup-black/70 leading-relaxed">
                  Vous pouvez chercher un artisan qui vous correspond ici :
                </p>
              </div>
              <button
                onClick={() => navigate('/trouver-artisan')}
                className="px-8 py-4 bg-fixup-blue text-white font-semibold rounded-xl hover:bg-fixup-blue/90 transition-all duration-200 text-lg mb-10"
              >
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5" />
                  <span>Trouver un artisan</span>
                </div>
              </button>
              <div className="border-t border-fixup-blue/10 pt-8">
                <p className="text-lg text-fixup-black/70 leading-relaxed">
                  Ou alors poster une annonce concernant votre demande et attendre qu'un artisan réponde en allant dans l'onglet{' '}
                  <button
                    onClick={() => setActiveTab('create')}
                    className="text-fixup-blue font-semibold hover:underline"
                  >
                    "Créer une demande"
                  </button>
                </p>
              </div>
            </div>
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
                      <option value="Produits électroniques">Produits électroniques</option>
                      <option value="Gros électroménager">Gros électroménager</option>
                      <option value="Petit électroménager">Petit électroménager</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="titre" className="block text-sm font-medium text-fixup-black mb-2">
                      Titre de la demande
                    </label>
                    <input
                      type="text"
                      id="titre"
                      name="titre"
                      value={formData.titre}
                      onChange={handleInputChange}
                      placeholder="Ex: Réparation d'un ordinateur"
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

                <div>
                  <label htmlFor="adresse" className="block text-sm font-medium text-fixup-black mb-2">
                    Adresse d'intervention (ou Code Postal)
                  </label>
                  <input
                    type="text"
                    id="adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    placeholder="Ex: 49000 Angers ou 12 rue de la Paix"
                    className="w-full border border-fixup-blue/20 rounded-lg py-3 px-3 focus:outline-none focus:ring-2 focus:ring-fixup-orange focus:border-fixup-orange"
                    required
                  />
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

              {error && (
                <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-lg shadow-sm text-center">
                  {error}
                </div>
              )}

              {loading ? (
                <LoadingSpinner message="Chargement des demandes..." />
              ) : demandes.length === 0 ? (
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
                  {demandes.map((demande) => {
                    const imageUrl = getImageUrl(demande);
                    return (
                      <div key={demande.id} className="bg-fixup-white rounded-xl shadow-lg overflow-hidden border border-fixup-blue/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="h-48 bg-cover bg-center relative" style={{
                          backgroundImage: `url(${imageUrl || getCategoryImage(demande.type_reparation || 'exterieur')})`
                        }}>
                        </div>

                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-semibold text-fixup-black line-clamp-1">
                              {demande.titre || getCategoryName(demande.type_reparation || 'exterieur')}
                            </h3>
                          </div>

                          <p className="text-base text-fixup-black/70 mb-4 line-clamp-2">
                            {demande.description || 'Aucune description'}
                          </p>

                          <div className="flex flex-col text-sm text-fixup-black mb-3 space-y-1">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span className="truncate">{demande.adresse || 'Adresse non spécifiée'}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>{new Date(demande.date_creation).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              <span>{getArtisanDisplayName(demande)}</span>
                            </div>
                          </div>

                          {demande.status && (
                            <div className="flex justify-center mt-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(demande.status)}`}>
                                {demande.status}
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
