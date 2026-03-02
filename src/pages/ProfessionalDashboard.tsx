import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { fetchDemandes, fetchArtisanDemandes, updateDemandeStatus } from '../services/api';
import type { Demande } from '../types/types';
import { FileText, MapPin, Calendar, Check, X, User } from 'lucide-react';

export function ProfessionalDashboard() {
  const [activeTab, setActiveTab] = useState<'publiques' | 'ciblees'>('publiques');
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  const loadDemandes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'publiques') {
        // Here we could filter by 'en attente' using backend params if implemented,
        // but for now we fetch and filter in frontend to be safe.
        const allDemandes = await fetchDemandes();
        // Public demands: no id_artisan, and status 'en_attente'
        const publicDemandes = allDemandes.filter(d => !d.id_artisan && d.status === 'en_attente');
        setDemandes(publicDemandes);
      } else {
        // Demandes ciblées vers cet artisan (inclut en attente, accepte, termine, refuse)
        const artisanDemandes = await fetchArtisanDemandes(userId);
        setDemandes(artisanDemandes);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  }, [userId, activeTab]);

  useEffect(() => {
    loadDemandes();
  }, [loadDemandes]);

  const handleUpdateStatus = async (demandeId: number, status: 'acceptee' | 'refusee' | 'terminee') => {
    try {
      await updateDemandeStatus(demandeId, {
        status,
        id_artisan_assigne: status === 'acceptee' ? parseInt(userId!) : undefined
      });
      setSuccessMsg(`Demande ${status} avec succès`);
      setTimeout(() => setSuccessMsg(''), 3000);
      loadDemandes();
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
      setTimeout(() => setError(''), 3000);
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

  const getImageUrl = (demande: Demande) => {
    if (demande.first_photo_id) {
      return `${API_BASE_URL}/api/demandes/${demande.id}/photos/${demande.first_photo_id}`;
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'en_attente':
      case 'en attente':
        return 'bg-fixup-orange/10 text-fixup-orange border border-fixup-orange/20';
      case 'acceptee':
      case 'acceptée':
        return 'bg-fixup-green/10 text-fixup-green border border-fixup-green/20';
      case 'refusee':
      case 'refusée':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'terminee':
      case 'terminée':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fixup-white to-fixup-blue/10 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-4xl font-bold text-fixup-black text-center sm:text-left">
            Espace Artisan
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/messagerie')}
              className="px-4 py-2 bg-fixup-blue text-white font-medium rounded-lg hover:bg-fixup-blue/90 transition-colors"
            >
              Messages
            </button>
            <button
              onClick={() => navigate('/edit-profil-artisan')}
              className="px-4 py-2 bg-fixup-orange text-white font-medium rounded-lg hover:bg-fixup-orange/90 transition-colors"
            >
              Voir mon profil d'artisan
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2 border border-fixup-blue/20 inline-flex">
            <button
              onClick={() => setActiveTab('publiques')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'publiques'
                ? 'bg-fixup-blue text-white shadow-md'
                : 'text-fixup-black hover:bg-fixup-blue/10'
                }`}
            >
              <FileText className="w-4 h-4" />
              Demandes Publiques
            </button>
            <button
              onClick={() => setActiveTab('ciblees')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'ciblees'
                ? 'bg-fixup-blue text-white shadow-md'
                : 'text-fixup-black hover:bg-fixup-blue/10'
                }`}
            >
              <User className="w-4 h-4" />
              Mes Demandes Ciblées
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg shadow-sm">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-4 text-sm text-fixup-green bg-fixup-green/10 rounded-lg shadow-sm">
            {successMsg}
          </div>
        )}

        {/* List of Demandes */}
        {loading ? (
          <LoadingSpinner message="Chargement des demandes..." />
        ) : demandes.length === 0 ? (
          <div className="text-center text-fixup-black/70 py-12 bg-white rounded-xl shadow-sm border border-fixup-blue/20">
            {activeTab === 'publiques'
              ? 'Aucune demande publique disponible pour le moment.'
              : 'Aucune demande ciblée ne vous a été adressée.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demandes.map((demande) => {
              const imageUrl = getImageUrl(demande) || getCategoryImage(demande.type_reparation || 'exterieur');
              return (
                <div key={demande.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-fixup-blue/20 flex flex-col">
                  {/* Image */}
                  <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${imageUrl})` }}>
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm ${getStatusBadge(demande.status)}`}>
                        {demande.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-3">
                      <h3 className="text-xl font-semibold text-fixup-black line-clamp-1">
                        {demande.titre || demande.type_reparation}
                      </h3>
                      {demande.Prenom && (
                        <span className="text-sm text-fixup-black/70">
                          Par {demande.Prenom} {demande.Nom}
                        </span>
                      )}
                    </div>

                    <p className="text-base text-fixup-black/70 mb-4 line-clamp-3 flex-1">
                      {demande.description || 'Aucune description'}
                    </p>

                    <div className="flex flex-col gap-2 text-sm text-fixup-black mb-6">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate">{demande.adresse || 'Non spécifiée'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(demande.date_creation).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {demande.status === 'en_attente' && (
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => handleUpdateStatus(demande.id, 'acceptee')}
                          className="flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium text-white bg-fixup-green hover:bg-fixup-green/90 transition-colors"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accepter
                        </button>
                        {activeTab === 'ciblees' && (
                          <button
                            onClick={() => handleUpdateStatus(demande.id, 'refusee')}
                            className="flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium text-fixup-black bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-300"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Refuser
                          </button>
                        )}
                      </div>
                    )}
                    {demande.status === 'acceptee' && (
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => handleUpdateStatus(demande.id, 'terminee')}
                          className="flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium text-white bg-fixup-blue hover:bg-blue-600 transition-colors"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Marquer Terminé
                        </button>
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
  );
}
