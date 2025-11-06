import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';

interface Offer {
  Id_devis: number;
  description: string;
  Date: string;
  Id_user: number;
  type_reparation?: string;
  prix?: string;
  adresse_facturation?: string;
  Code_postal?: string;
  nom_utilisateur?: string;
  Prenom?: string;
  Nom?: string;
  user_name?: string;
  user_email?: string;
  status?: string;
  Image?: string;
}

interface UseOffersOptions {
  cacheKey?: string;
  cacheExpiration?: number; // en millisecondes (défaut: 5 minutes)
  autoFetch?: boolean; // charger automatiquement au montage
}

const CACHE_EXPIRATION_DEFAULT = 5 * 60 * 1000; // 5 minutes

export function useOffers(options: UseOffersOptions = {}) {
  const {
    cacheKey = 'offers_cache',
    cacheExpiration = CACHE_EXPIRATION_DEFAULT,
    autoFetch = true
  } = options;

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour obtenir les données du cache
  const getCachedData = useCallback((): { data: Offer[]; timestamp: number } | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const parsed = JSON.parse(cached);
      const now = Date.now();

      // Vérifier si le cache est expiré
      if (now - parsed.timestamp > cacheExpiration) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return parsed;
    } catch (err) {
      console.error('Erreur lors de la lecture du cache:', err);
      return null;
    }
  }, [cacheKey, cacheExpiration]);

  // Fonction pour sauvegarder dans le cache
  const saveToCache = useCallback((data: Offer[]) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du cache:', err);
    }
  }, [cacheKey]);

  // Fonction interne pour charger depuis l'API
  const fetchOffersFromAPI = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/offers`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // Nettoyer et valider les données
      const validOffers = data.map((offer: any) => ({
        ...offer,
        type_reparation: offer.type_reparation || 'exterieur',
        prix: offer.prix || '0',
        adresse_facturation: offer.adresse_facturation || '',
        Code_postal: offer.Code_postal || '',
        nom_utilisateur: offer.nom_utilisateur || offer.user_name || offer.user_email || 'Utilisateur anonyme',
        Prenom: offer.Prenom || '',
        Nom: offer.Nom || '',
        user_name: offer.user_name || offer.nom_utilisateur || 'Utilisateur inconnu',
        user_email: offer.user_email || '',
        status: offer.status || 'En attente'
      }));

      setOffers(validOffers);
      saveToCache(validOffers);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des offres:', err);
      setError('Impossible de charger les demandes de réparation');
      
      // En cas d'erreur, essayer d'utiliser le cache même s'il est expiré
      const cached = getCachedData();
      if (cached) {
        setOffers(cached.data);
      }
    } finally {
      setLoading(false);
    }
  }, [saveToCache, getCachedData]);

  // Fonction pour charger les offres depuis l'API
  const fetchOffers = useCallback(async (forceRefresh = false) => {
    // Si on ne force pas le rafraîchissement, vérifier le cache d'abord
    if (!forceRefresh) {
      const cached = getCachedData();
      if (cached) {
        setOffers(cached.data);
        setLoading(false);
        setError(null);
        // Charger en arrière-plan pour mettre à jour le cache
        fetchOffersFromAPI();
        return;
      }
    }

    // Charger depuis l'API
    await fetchOffersFromAPI();
  }, [getCachedData, fetchOffersFromAPI]);

  // Charger automatiquement au montage si autoFetch est true
  useEffect(() => {
    if (autoFetch) {
      fetchOffers();
    }
  }, [autoFetch, fetchOffers]);

  // Fonction pour invalider le cache
  const invalidateCache = useCallback(() => {
    localStorage.removeItem(cacheKey);
  }, [cacheKey]);

  // Fonction pour forcer le rafraîchissement
  const refresh = useCallback(() => {
    invalidateCache();
    fetchOffers(true);
  }, [invalidateCache, fetchOffers]);

  return {
    offers,
    loading,
    error,
    fetchOffers,
    refresh,
    invalidateCache
  };
}

