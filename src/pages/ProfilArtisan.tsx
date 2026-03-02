import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, Flag, X, MessageCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import {
    fetchArtisan,
    fetchArtisanCategories,
    fetchArtisanAvis,
    fetchArtisanAvisStats,
    fetchArtisanPhotos,
    getPhotoUrl,
    postDemande,
    getProfilePhotoUrl,
    getArtisanCoverPhotoUrl,
    fetchArtisanCoverPhotoMetadata
} from '../services/api';
import type { ArtisanProfile, ArtisanCategory, Avis, AvisStats, ArtisanPhoto } from '../types/types';
import { LoadingSpinner } from '../components/LoadingSpinner';

import handShake from '../assets/hand-shake.png';

// Fix default marker icon (Leaflet + webpack/vite issue)
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// ─── Helper: color per main category ─────────────────────────────────────────

const getCategoryColor = (mainCat: string) => {
    const lc = mainCat.toLowerCase();
    if (lc.includes('électronique') || lc.includes('electronique')) return 'bg-fixup-green text-white';
    if (lc.includes('gros')) return 'bg-fixup-orange text-white';
    if (lc.includes('petit')) return 'bg-fixup-blue text-white';
    return 'bg-gray-200 text-fixup-black';
};

const getCategoryTagColor = (mainCat: string) => {
    const lc = mainCat.toLowerCase();
    if (lc.includes('électronique') || lc.includes('electronique')) return 'text-fixup-green';
    if (lc.includes('gros')) return 'text-fixup-orange';
    if (lc.includes('petit')) return 'text-fixup-blue';
    return 'text-gray-500';
};

// ─── Avatar Icons (pp-anonyme) ───────────────────────────────────────────────

import ppAvatar1 from '../assets/pp-anonymes_Fixaly-01.png';
import ppAvatar2 from '../assets/pp-anonymes_Fixaly-02.png';
import ppAvatar3 from '../assets/pp-anonymes_Fixaly-03.png';
import ppAvatar4 from '../assets/pp-anonymes_Fixaly-04.png';

const AVATARS = [ppAvatar1, ppAvatar2, ppAvatar3, ppAvatar4];
const getAvatar = (id: number) => AVATARS[id % AVATARS.length];

// ─── Component ───────────────────────────────────────────────────────────────

export function ProfilArtisan() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const artisanId = parseInt(id || '1');

    // Data states
    const [profile, setProfile] = useState<ArtisanProfile | null>(null);
    const [categories, setCategories] = useState<ArtisanCategory[]>([]);
    const [reviews, setReviews] = useState<Avis[]>([]);
    const [avisStats, setAvisStats] = useState<AvisStats | null>(null);
    const [photos, setPhotos] = useState<ArtisanPhoto[]>([]);
    const [hasCoverPhoto, setHasCoverPhoto] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI states
    const [activeTab, setActiveTab] = useState<'presentation' | 'avis' | 'photos'>('presentation');
    const [showVoirTout, setShowVoirTout] = useState(false);
    const [showFiltre, setShowFiltre] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showDemande, setShowDemande] = useState(false);
    const [demandeTitre, setDemandeTitre] = useState('');
    const [demandeDescription, setDemandeDescription] = useState('');
    const [demandeTypeReparation, setDemandeTypeReparation] = useState('Produits électroniques');
    const [demandeAdresse, setDemandeAdresse] = useState('');
    const [demandePhotos, setDemandePhotos] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [demandeSending, setDemandeSending] = useState(false);
    const [demandeSuccess, setDemandeSuccess] = useState('');
    const [demandeError, setDemandeError] = useState('');

    // Filter state for reviews
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const [allCategoriesChecked, setAllCategoriesChecked] = useState(true);

    // ── Fetch data ────────────────────────────────────────────────────────────

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [profileData, categoriesData, reviewsData, statsData, photosData, coverMeta] =
                    await Promise.allSettled([
                        fetchArtisan(artisanId),
                        fetchArtisanCategories(artisanId),
                        fetchArtisanAvis(artisanId, { limit: 50 }),
                        fetchArtisanAvisStats(artisanId),
                        fetchArtisanPhotos(artisanId),
                        fetchArtisanCoverPhotoMetadata(artisanId),
                    ]);

                if (profileData.status === 'fulfilled') setProfile(profileData.value);
                else throw new Error('Profil introuvable');

                if (categoriesData.status === 'fulfilled') setCategories(categoriesData.value);
                if (reviewsData.status === 'fulfilled') setReviews(reviewsData.value);
                if (statsData.status === 'fulfilled') setAvisStats(statsData.value);
                if (photosData.status === 'fulfilled') setPhotos(photosData.value);
                if (coverMeta.status === 'fulfilled') setHasCoverPhoto(coverMeta.value.hasPhotoProfilArtisan);
            } catch (err: any) {
                console.error('Erreur chargement profil artisan:', err);
                setError(err.message || 'Impossible de charger ce profil');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [artisanId]);

    // ── Send demand / message ─────────────────────────────────────────────────

    const handleSendDemande = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            navigate('/login');
            return;
        }
        setDemandeSending(true);
        setDemandeError('');
        try {
            const formData = new FormData();
            formData.append('id_user', userId);
            formData.append('id_artisan', artisanId.toString());
            formData.append('titre', demandeTitre);
            formData.append('description', demandeDescription);
            formData.append('type_reparation', demandeTypeReparation);
            formData.append('adresse', demandeAdresse);

            demandePhotos.forEach(file => {
                formData.append('photos', file);
            });

            await postDemande(formData);

            setDemandeSuccess('Votre demande a été envoyée avec succès !');
            setDemandeTitre('');
            setDemandeDescription('');
            setDemandeAdresse('');
            setDemandeTypeReparation('Plomberie');
            setDemandePhotos([]);
            setImagePreviews([]);

            setTimeout(() => {
                setShowDemande(false);
                setDemandeSuccess('');
            }, 2000);
        } catch (err) {
            console.error('Erreur envoi demande:', err);
            setDemandeError('Impossible d\'envoyer la demande. Veuillez réessayer.');
        } finally {
            setDemandeSending(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setDemandePhotos(prev => [...prev, ...files]);

            const previews: string[] = [];
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target?.result) {
                        previews.push(e.target.result as string);
                        if (previews.length === files.length) {
                            setImagePreviews(prev => [...prev, ...previews]);
                        }
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    // ── Derived data ──────────────────────────────────────────────────────────

    // Get unique categories that have reviews
    const reviewCategories = reviews.reduce<{ mainCategory: string; subcategory: string }[]>(
        (acc, r) => {
            const cat = r.categorie || 'Autre';
            if (!acc.find((c) => c.subcategory === cat)) {
                acc.push({ mainCategory: cat, subcategory: cat });
            }
            return acc;
        },
        []
    );

    // Group review categories by main category
    const groupedReviewCategories = reviewCategories.reduce<Record<string, string[]>>((acc, c) => {
        if (!acc[c.mainCategory]) acc[c.mainCategory] = [];
        if (!acc[c.mainCategory].includes(c.subcategory)) acc[c.mainCategory].push(c.subcategory);
        return acc;
    }, {});

    // Filtered reviews
    const filteredReviews =
        allCategoriesChecked || selectedFilters.length === 0
            ? reviews
            : reviews.filter((r) => selectedFilters.includes(r.categorie || 'Autre'));

    // Rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
        const count = avisStats?.distribution?.[stars] || reviews.filter((r) => r.note === stars).length;
        const total = avisStats?.nombre_total || reviews.length;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return { stars, count, pct };
    });

    // Toggle filter checkbox
    const toggleFilter = (subcategory: string) => {
        setAllCategoriesChecked(false);
        setSelectedFilters((prev) =>
            prev.includes(subcategory)
                ? prev.filter((s) => s !== subcategory)
                : [...prev, subcategory]
        );
    };

    const toggleAllCategories = () => {
        setAllCategoriesChecked(true);
        setSelectedFilters([]);
    };

    // Get first few items for sidebar display
    const sidebarItems = categories.flatMap((c) => c.items).slice(0, 7);

    // Group all categories by main category for "Voir tout"
    const groupedCategories = categories.reduce<
        Record<string, { subcategory: string; items: string[] }[]>
    >((acc, c) => {
        if (!acc[c.mainCategory]) acc[c.mainCategory] = [];
        acc[c.mainCategory].push({ subcategory: c.subcategory, items: c.items });
        return acc;
    }, {});

    // Profile display values
    const displayName = profile ? `${profile.Prenom} ${profile.Nom?.charAt(0)}.` : '';
    const displayRating = avisStats?.note_moyenne ?? profile?.note_moyenne ?? 0;
    const displayReviewCount = avisStats?.nombre_total ?? profile?.nombre_avis ?? 0;

    // ── Loading / Error states ────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-fixup-white pt-20 flex items-center justify-center">
                <LoadingSpinner message="Chargement du profil..." />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-fixup-white pt-20">
                <div className="max-w-5xl mx-auto px-4 py-10 text-center">
                    <p className="text-red-500 text-lg mb-4">{error || 'Profil introuvable'}</p>
                    <button
                        onClick={() => navigate('/trouver-artisan')}
                        className="px-6 py-2 bg-fixup-blue text-white rounded-lg"
                    >
                        Retour à la recherche
                    </button>
                </div>
            </div>
        );
    }

    // ── Render: Star rating row ──────────────────────────────────────────────

    const renderStars = (rating: number) => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i <= rating
                        ? 'text-fixup-orange fill-fixup-orange'
                        : 'text-gray-300'
                        }`}
                />
            ))}
        </div>
    );

    // ── Render: Header ───────────────────────────────────────────────────────

    const renderHeader = () => (
        <div className="relative mb-0">
            {/* Cover photo */}
            <div className="h-48 bg-gray-300 rounded-t-2xl relative overflow-hidden">
                {hasCoverPhoto ? (
                    <img src={getArtisanCoverPhotoUrl(artisanId)} alt="Couverture" className="w-full h-full object-cover" />
                ) : (
                    <p className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">photo</p>
                )}
                {/* Favorite button */}
                <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="absolute top-4 left-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors z-10"
                >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-fixup-orange'}`} />
                </button>

                {/* Rating badge */}
                <button
                    onClick={() => setActiveTab('avis')}
                    className="absolute bottom-4 right-4 bg-white rounded-full px-3 py-1.5 shadow-md flex items-center gap-1.5 hover:shadow-lg transition-shadow"
                >
                    <Star className="w-4 h-4 text-fixup-orange fill-fixup-orange" />
                    <span className="text-sm font-bold text-fixup-black">
                        {displayRating.toFixed(1)}/5
                    </span>
                    <span className="text-xs text-fixup-black/50">
                        ({displayReviewCount} avis)
                    </span>
                </button>
            </div>

            {/* Profile info row */}
            <div className="bg-white px-8 pb-6 pt-0 relative">
                {/* Avatar */}
                <div className="absolute -top-12 left-8">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-fixup-orange/10 flex items-center justify-center overflow-hidden">
                        <img
                            src={getProfilePhotoUrl(artisanId)}
                            alt={displayName}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = getAvatar(artisanId); }}
                        />
                    </div>
                </div>

                <div className="flex items-start justify-between pt-14">
                    <div>
                        <h1 className="text-2xl font-bold text-fixup-black">{displayName}</h1>
                        <p className="text-sm text-fixup-black/70">{profile.poste || profile.Domaine_activite || ''}</p>
                        <p className="text-sm text-fixup-black/50">
                            {profile.Adresse || profile.Code_postal || ''}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {profile.date_inscription && (
                            <span className="text-xs text-fixup-black/50">
                                Inscrit depuis le {new Date(profile.date_inscription).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const userId = localStorage.getItem('userId');
                                    if (!userId) { navigate('/login'); return; }
                                    navigate(`/messagerie?contact=${artisanId}`);
                                }}
                                className="px-4 py-2.5 border-2 border-fixup-blue text-fixup-blue font-medium rounded-lg hover:bg-fixup-blue hover:text-white transition-all duration-200 flex items-center gap-2"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Contacter
                            </button>
                            <button
                                onClick={() => setShowDemande(true)}
                                className="px-6 py-2.5 border-2 border-fixup-black text-fixup-black font-medium rounded-lg hover:bg-fixup-green hover:border-fixup-green hover:text-white transition-all duration-200"
                            >
                                Faire une demande
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ── Render: Tabs ─────────────────────────────────────────────────────────

    const renderTabs = () => (
        <div className="bg-white border-b border-gray-200">
            <div className="flex">
                {[
                    { key: 'presentation' as const, label: 'Présentation' },
                    { key: 'avis' as const, label: 'Avis' },
                    { key: 'photos' as const, label: 'Photos' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${activeTab === tab.key
                            ? 'text-fixup-orange border-b-2 border-fixup-orange'
                            : 'text-fixup-black/50 hover:text-fixup-black'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );

    // ── Render: Sidebar (Présentation) ───────────────────────────────────────

    const renderPresentationSidebar = () => (
        <div className="space-y-6 flex flex-col items-center">
            {/* Mises en relation */}
            <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-3">
                    <img src={handShake} alt="Mises en relation" className="w-10 h-10 object-contain" />
                    <p className="text-[32px] font-bold text-fixup-black">
                        {profile.nombre_mises_en_relation ?? 0}
                    </p>
                </div>
                <p className="text-xl font-medium text-fixup-black mt-1">mises en relations</p>
            </div>

            <div className="w-full h-px bg-gray-200 mt-6 mb-6"></div>

            {/* Category tags */}
            {sidebarItems.length > 0 && (
                <div className="flex flex-col items-center text-center w-full">
                    <p className="text-xl font-semibold text-fixup-black mb-6">
                        Répond aux demandes de
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {sidebarItems.map((item) => (
                            <span
                                key={item}
                                className="px-4 py-2 bg-[#DDF1FF] rounded-lg text-[15px] font-medium text-fixup-black"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowVoirTout(true)}
                        className="mt-6 px-8 py-2.5 border-2 border-fixup-green text-fixup-black text-[17px] font-bold rounded-xl hover:bg-fixup-green/10 transition-colors bg-white shadow-sm"
                    >
                        Voir tout
                    </button>
                </div>
            )}

            {/* Signaler */}
            <div className="bg-white rounded-xl shadow-sm mt-8 border border-gray-100 w-full p-4 flex justify-center">
                <button className="flex items-center gap-2 text-[17px] font-medium text-gray-400 hover:text-gray-600 transition-colors">
                    <Flag className="w-5 h-5" />
                    Signaler ce profil
                </button>
            </div>
        </div>
    );

    // ── Parse daily availability ──────────────────────────────────────────────

    const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    type DayAvailability = { disponible: boolean; horaire: string };
    type WeekSchedule = Record<string, DayAvailability>;

    const defaultSchedule: WeekSchedule = DAYS.reduce((acc, day) => {
        acc[day] = { disponible: true, horaire: 'Disponible 24h/24' };
        return acc;
    }, {} as WeekSchedule);

    let weekSchedule: WeekSchedule = defaultSchedule;
    if (profile.statut_disponibilite) {
        try {
            const parsed = typeof profile.statut_disponibilite === 'string'
                ? JSON.parse(profile.statut_disponibilite)
                : profile.statut_disponibilite;
            if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed.Lundi !== undefined) {
                weekSchedule = parsed;
            }
        } catch { /* keep default */ }
    }

    const renderPresentationContent = () => (
        <div className="space-y-8">
            {/* Bio */}
            <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-sm text-fixup-black whitespace-pre-line leading-relaxed">
                    {profile.description ? `« ${profile.description} »` : <span className="text-fixup-black/40 italic">Aucune description renseignée.</span>}
                </p>
            </div>

            {/* Disponibilités */}
            <div>
                <h3 className="text-lg font-bold text-fixup-black mb-4">Disponibilités</h3>
                <div className="space-y-1">
                    {DAYS.map(day => {
                        const avail = weekSchedule[day] || { disponible: false, horaire: 'Pas disponible' };
                        return (
                            <div key={day} className="flex items-center gap-4 py-1.5">
                                <span className="w-24 text-sm font-medium text-fixup-black">{day} :</span>
                                <span className={`text-sm ${avail.disponible ? 'text-fixup-black/70' : 'text-red-400'}`}>
                                    {avail.horaire || (avail.disponible ? 'Disponible 24h/24' : 'Pas disponible')}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Map */}
            <div className="h-56 rounded-xl overflow-hidden relative z-0">
                <MapContainer center={[47.4784, -0.5632]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[47.4784, -0.5632]} />
                </MapContainer>
            </div>
        </div>
    );

    // ── Render: Sidebar (Avis) ───────────────────────────────────────────────

    const renderAvisSidebar = () => (
        <div className="space-y-6">
            {/* Overall rating */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <Star className="w-6 h-6 text-fixup-orange fill-fixup-orange" />
                    <span className="text-3xl font-bold text-fixup-black">
                        {displayRating.toFixed(1)}/5
                    </span>
                </div>
                <p className="text-sm text-fixup-black/50">
                    basé sur {displayReviewCount} avis
                </p>
            </div>

            {/* Rating distribution bars */}
            <div className="space-y-2">
                {ratingDistribution.map((row) => (
                    <div key={row.stars} className="flex items-center gap-2 text-sm">
                        <span className="w-3 text-fixup-black font-medium">{row.stars}</span>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${row.stars >= 4
                                    ? 'bg-fixup-green'
                                    : row.stars === 3
                                        ? 'bg-fixup-orange'
                                        : 'bg-red-400'
                                    }`}
                                style={{ width: `${row.pct}%` }}
                            />
                        </div>
                        <span className="w-10 text-right text-fixup-black/50">
                            {row.pct > 0 ? `${row.pct}%` : '–'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Filtrer button */}
            <div className="flex justify-center">
                <button
                    onClick={() => setShowFiltre(true)}
                    className="px-6 py-2 border-2 border-fixup-blue text-fixup-black text-sm font-medium rounded-full hover:bg-fixup-blue/10 transition-colors"
                >
                    Filtrer
                </button>
            </div>

            {/* Signaler */}
            <button className="flex items-center gap-2 text-sm text-fixup-black/40 hover:text-fixup-black/60 transition-colors">
                <Flag className="w-4 h-4" />
                Signaler ce profil
            </button>
        </div>
    );

    // ── Render: Content (Avis) ───────────────────────────────────────────────

    const renderAvisContent = () => (
        <div className="space-y-6">
            {filteredReviews.length === 0 ? (
                <p className="text-center text-fixup-black/50 py-8">Aucun avis pour le moment.</p>
            ) : (
                filteredReviews.map((review) => (
                    <div
                        key={review.id}
                        className="border-b border-gray-100 pb-6 last:border-0"
                    >
                        {/* Review header */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-fixup-green/20 flex items-center justify-center">
                                    <span className="text-sm font-bold text-fixup-green">
                                        {(review.Prenom || '?').charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-fixup-black">
                                        {review.Prenom} {review.Nom?.charAt(0)}.
                                    </p>
                                    <p className="text-xs text-fixup-black/40">
                                        posté le {new Date(review.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            {renderStars(review.note)}
                        </div>

                        {/* Category tag */}
                        {review.categorie && (
                            <p className={`text-xs font-medium mb-2 ${getCategoryTagColor(review.categorie)}`}>
                                {review.categorie}
                            </p>
                        )}

                        {/* Review text */}
                        <p className="text-sm text-fixup-black/80 mb-3">{review.commentaire}</p>

                        {/* Artisan responses */}
                        {review.reponses && review.reponses.length > 0 && review.reponses.map((rep) => (
                            <div key={rep.id} className="ml-8 pl-4 border-l-2 border-fixup-orange/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded-full bg-fixup-orange/20 flex items-center justify-center">
                                        <span className="text-xs font-bold text-fixup-orange">
                                            {(rep.Prenom || displayName).charAt(0)}
                                        </span>
                                    </div>
                                    <p className="font-bold text-sm text-fixup-black">
                                        {rep.Prenom} {rep.Nom?.charAt(0)}.
                                    </p>
                                </div>
                                <p className="text-sm text-fixup-black/70">
                                    {rep.commentaire}
                                </p>
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    );

    // ── Render: Photos tab ───────────────────────────────────────────────────

    const renderPhotosContent = () => (
        <div className="py-8">
            {photos.length === 0 ? (
                <p className="text-center text-fixup-black/50 py-8">Aucune photo pour le moment.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo) => (
                        <div
                            key={photo.id}
                            className="aspect-square bg-gray-100 rounded-xl overflow-hidden"
                        >
                            <img
                                src={getPhotoUrl(photo.id)}
                                alt={photo.name || `Photo ${photo.id}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // ── Modal: Voir tout ─────────────────────────────────────────────────────

    const renderVoirToutModal = () => {
        if (!showVoirTout) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setShowVoirTout(false)}
                />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-fixup-black">
                            Répond aux demandes de
                        </h2>
                        <button
                            onClick={() => setShowVoirTout(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-fixup-black/60" />
                        </button>
                    </div>

                    {/* Scrollable content */}
                    <div className="overflow-y-auto p-6 space-y-6">
                        {Object.entries(groupedCategories).map(([mainCat, subs]) => (
                            <div key={mainCat}>
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${getCategoryColor(mainCat)}`}
                                >
                                    {mainCat} :
                                </span>
                                {subs.map((sub) => (
                                    <div key={sub.subcategory} className="mb-4 ml-1">
                                        <p className="text-sm font-medium text-fixup-black mb-2">
                                            {sub.subcategory} :
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {sub.items.map((item) => (
                                                <span
                                                    key={item}
                                                    className="px-3 py-1 bg-gray-100 rounded-full text-xs text-fixup-black border border-gray-200"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                        {Object.keys(groupedCategories).length === 0 && (
                            <p className="text-center text-fixup-black/50">Aucune catégorie renseignée.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ── Modal: Filtrer ───────────────────────────────────────────────────────

    const renderFiltreModal = () => {
        if (!showFiltre) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setShowFiltre(false)}
                />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 max-h-[80vh] flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div>
                            <h2 className="text-lg font-bold text-fixup-black">Filtres</h2>
                            <p className="text-xs text-fixup-black/50 mt-1">
                                Comprend uniquement les catégories ayant reçues un avis
                            </p>
                        </div>
                        <button
                            onClick={() => setShowFiltre(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-fixup-black/60" />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-6 space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={allCategoriesChecked}
                                onChange={toggleAllCategories}
                                className="w-4 h-4 accent-fixup-green"
                            />
                            <span className="text-sm font-semibold text-fixup-black">
                                ✅ Toutes les catégories
                            </span>
                        </label>

                        {Object.entries(groupedReviewCategories).map(([mainCat, subs]) => (
                            <div key={mainCat}>
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${getCategoryColor(mainCat)}`}
                                >
                                    {mainCat} :
                                </span>
                                {subs.map((sub) => (
                                    <label
                                        key={sub}
                                        className="flex items-center gap-3 ml-1 mb-2 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={allCategoriesChecked || selectedFilters.includes(sub)}
                                            onChange={() => toggleFilter(sub)}
                                            className="w-4 h-4 accent-fixup-green"
                                        />
                                        <span className="text-sm text-fixup-black">{sub}</span>
                                    </label>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="p-6 border-t border-gray-100">
                        <button
                            onClick={() => setShowFiltre(false)}
                            className="w-full py-2.5 border-2 border-fixup-black text-fixup-black text-sm font-medium rounded-full hover:bg-fixup-green hover:border-fixup-green hover:text-white transition-all duration-200"
                        >
                            Voir les résultats
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Modal: Faire une demande ──────────────────────────────────────────────

    const renderDemandeModal = () => {
        if (!showDemande) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setShowDemande(false)}
                />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-fixup-black">
                            Faire une demande
                        </h2>
                        <button
                            onClick={() => setShowDemande(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-fixup-black/60" />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-6 space-y-6">
                        {demandeSuccess && (
                            <div className="p-3 bg-fixup-green/10 text-fixup-green rounded-lg text-sm font-medium">
                                {demandeSuccess}
                            </div>
                        )}
                        {demandeError && (
                            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                                {demandeError}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-fixup-black mb-2">
                                Titre de la demande
                            </label>
                            <input
                                type="text"
                                value={demandeTitre}
                                onChange={(e) => setDemandeTitre(e.target.value)}
                                placeholder="Ex: Réparation chauffe-eau"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-fixup-black focus:outline-none focus:border-fixup-orange focus:ring-1 focus:ring-fixup-orange"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-fixup-black mb-2">
                                Type de réparation
                            </label>
                            <select
                                value={demandeTypeReparation}
                                onChange={(e) => setDemandeTypeReparation(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-fixup-black focus:outline-none focus:border-fixup-orange focus:ring-1 focus:ring-fixup-orange"
                            >
                                <option value="Produits électroniques">Produits électroniques</option>
                                <option value="Gros électroménager">Gros électroménager</option>
                                <option value="Petit électroménager">Petit électroménager</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-fixup-black mb-2">
                                Décrivez votre besoin
                            </label>
                            <textarea
                                value={demandeDescription}
                                onChange={(e) => setDemandeDescription(e.target.value)}
                                placeholder="Détaillez le problème..."
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-fixup-black placeholder:text-fixup-black/30 focus:outline-none focus:border-fixup-orange focus:ring-1 focus:ring-fixup-orange resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-fixup-black mb-1">
                                Ajoutez des photos (optionnel)
                            </label>
                            <p className="text-xs text-fixup-black/50 mb-3">
                                Cela aidera l'artisan à mieux se projeter sur votre demande
                            </p>
                            <input
                                type="file"
                                id="photos-upload"
                                name="photos"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-sm text-fixup-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-fixup-orange/10 file:text-fixup-orange hover:file:bg-fixup-orange/20 cursor-pointer mb-2"
                            />

                            {/* Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-3 mt-3">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Aperçu ${index + 1}`}
                                                className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newPreviews = [...imagePreviews];
                                                    newPreviews.splice(index, 1);
                                                    setImagePreviews(newPreviews);
                                                    const newPhotos = [...demandePhotos];
                                                    newPhotos.splice(index, 1);
                                                    setDemandePhotos(newPhotos);
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-fixup-black mb-2">
                                Adresse d'intervention
                            </label>
                            <input
                                type="text"
                                value={demandeAdresse}
                                onChange={(e) => setDemandeAdresse(e.target.value)}
                                placeholder="Code postal, ville ou adresse complète"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-fixup-black placeholder:text-fixup-black/30 focus:outline-none focus:border-fixup-orange focus:ring-1 focus:ring-fixup-orange"
                            />
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100">
                        <button
                            onClick={handleSendDemande}
                            disabled={demandeSending || !demandeDescription}
                            className="w-full py-2.5 bg-fixup-orange text-white text-sm font-medium rounded-full hover:bg-fixup-green transition-all duration-200 disabled:opacity-50"
                        >
                            {demandeSending ? 'Envoi en cours...' : 'Envoyer la demande'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Main render ──────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-fixup-white pt-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {renderHeader()}
                    {renderTabs()}

                    <div className="flex flex-col md:flex-row">
                        {/* Sidebar */}
                        <div className="w-full md:w-72 border-r border-gray-100 p-6">
                            {activeTab === 'presentation' && renderPresentationSidebar()}
                            {activeTab === 'avis' && renderAvisSidebar()}
                        </div>

                        {/* Main content */}
                        <div className="flex-1 p-6">
                            {activeTab === 'presentation' && renderPresentationContent()}
                            {activeTab === 'avis' && renderAvisContent()}
                            {activeTab === 'photos' && renderPhotosContent()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {renderVoirToutModal()}
            {renderFiltreModal()}
            {renderDemandeModal()}
        </div>
    );
}
