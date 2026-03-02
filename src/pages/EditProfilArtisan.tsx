import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Flag, X, Camera, Trash2, Save, Plus, Pencil, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import {
    fetchUserProfile,
    updateUserProfile,
    fetchArtisanCategories,
    fetchArtisanAvis,
    fetchArtisanAvisStats,
    fetchArtisanPhotos,
    uploadArtisanPhoto,
    deleteArtisanPhoto,
    getPhotoUrl,
    getProfilePhotoUrl, uploadProfilePhoto, deleteProfilePhoto, fetchProfilePhotoMetadata,
    getArtisanCoverPhotoUrl, uploadArtisanCoverPhoto, fetchArtisanCoverPhotoMetadata
} from '../services/api';
import type { UserProfile, ArtisanCategory, Avis, AvisStats, ArtisanPhoto } from '../types/types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CoverCropModal } from '../components/CoverCropModal';

import handShake from '../assets/hand-shake.png';

import avatar1 from '../assets/pp-anonymes_Fixaly-01.png';
import avatar2 from '../assets/pp-anonymes_Fixaly-02.png';
import avatar3 from '../assets/pp-anonymes_Fixaly-03.png';
import avatar4 from '../assets/pp-anonymes_Fixaly-04.png';

// Fix default marker icon
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// ─── Avatars pp-anonyme ──────────────────────────────────────────────────────

const AVATARS = [avatar1, avatar2, avatar3, avatar4];
const getAvatar = (id: number) => AVATARS[id % AVATARS.length];

// ─── Category colors ─────────────────────────────────────────────────────────

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

// ─── CATEGORIES list (same as TrouverArtisan) ────────────────────────────────

interface CategoryItem { name: string; subcategory: string; mainCategory: string; }

const CATEGORIES_LIST: CategoryItem[] = [
    { name: 'Ordinateurs (PC portables, unités centrales, écrans)', subcategory: 'Informatique et Bureautique', mainCategory: 'Produits électroniques' },
    { name: 'Périphériques (écrans de PC, imprimantes, onduleurs, souris)', subcategory: 'Informatique et Bureautique', mainCategory: 'Produits électroniques' },
    { name: 'Smartphones', subcategory: 'Téléphones et Objets Connectés', mainCategory: 'Produits électroniques' },
    { name: 'Montres connectées', subcategory: 'Téléphones et Objets Connectés', mainCategory: 'Produits électroniques' },
    { name: 'Télévisions', subcategory: 'Image et Son', mainCategory: 'Produits électroniques' },
    { name: 'Audio (enceintes Bluetooth, casques audio, appareils audio Hi-Fi)', subcategory: 'Image et Son', mainCategory: 'Produits électroniques' },
    { name: 'Photo (appareils de tous et appareils photo)', subcategory: 'Image et Son', mainCategory: 'Produits électroniques' },
    { name: 'Lave-linge', subcategory: 'Appareils de lavage', mainCategory: 'Gros électroménager' },
    { name: 'Sèche-linge (à condensation ou pompe à chaleur)', subcategory: 'Appareils de lavage', mainCategory: 'Gros électroménager' },
    { name: 'Lave-vaisselle', subcategory: 'Appareils de lavage', mainCategory: 'Gros électroménager' },
    { name: 'Fours encastrables et cuisinières', subcategory: 'Appareils de cuisson', mainCategory: 'Gros électroménager' },
    { name: 'Plaques de cuisson (induction, vitrocéramique, gaz)', subcategory: 'Appareils de cuisson', mainCategory: 'Gros électroménager' },
    { name: 'Micro-ondes (posables ou encastrés)', subcategory: 'Appareils de cuisson', mainCategory: 'Gros électroménager' },
    { name: 'Hottes aspirantes', subcategory: 'Appareils de cuisson', mainCategory: 'Gros électroménager' },
    { name: 'Réfrigérateurs (une porte, combinés, américains)', subcategory: 'Appareils de froid', mainCategory: 'Gros électroménager' },
    { name: 'Congélateurs (armoires ou coffres)', subcategory: 'Appareils de froid', mainCategory: 'Gros électroménager' },
    { name: 'Caves à vin', subcategory: 'Appareils de froid', mainCategory: 'Gros électroménager' },
    { name: 'Aspirateur de maison', subcategory: 'Maison', mainCategory: 'Petit électroménager' },
    { name: 'Aspirateur à main', subcategory: 'Maison', mainCategory: 'Petit électroménager' },
    { name: 'Aspirateur robot', subcategory: 'Maison', mainCategory: 'Petit électroménager' },
    { name: 'Nettoyeurs vapeur et fers à repasser', subcategory: 'Maison', mainCategory: 'Petit électroménager' },
    { name: 'Robots pâtissiers et multifonctions', subcategory: 'Cuisine', mainCategory: 'Petit électroménager' },
    { name: 'Blenders, mixeurs plongeants et centrifugeuses', subcategory: 'Cuisine', mainCategory: 'Petit électroménager' },
    { name: 'Friteuses et machines à pain', subcategory: 'Cuisine', mainCategory: 'Petit électroménager' },
    { name: 'Machines à café (capsules, grain, filtre)', subcategory: 'Cuisine', mainCategory: 'Petit électroménager' },
    { name: 'Bouilloires et grille-pains', subcategory: 'Cuisine', mainCategory: 'Petit électroménager' },
    { name: 'Sèche-cheveux, lisseurs/boucleurs', subcategory: 'Salle de bain', mainCategory: 'Petit électroménager' },
    { name: 'Tondeuses et épilateurs', subcategory: 'Salle de bain', mainCategory: 'Petit électroménager' },
    { name: 'Aspirateur broyeur souffleur', subcategory: 'Jardinage', mainCategory: 'Gros électroménager' },
    { name: 'Aspirateur de bassin', subcategory: 'Piscines', mainCategory: 'Gros électroménager' },
    { name: 'Aspirateur à eau et poussières', subcategory: 'Travaux', mainCategory: 'Gros électroménager' },
];

// Unique main categories and subcategories
const MAIN_CATEGORIES = [...new Set(CATEGORIES_LIST.map(c => c.mainCategory))];
const getSubcategories = (mainCat: string) => [...new Set(CATEGORIES_LIST.filter(c => c.mainCategory === mainCat).map(c => c.subcategory))];
const getItems = (subCat: string) => CATEGORIES_LIST.filter(c => c.subcategory === subCat).map(c => c.name);

// ─── Address suggestion ──────────────────────────────────────────────────────

interface AddressSuggestion { label: string; postcode: string; city: string; }

// ─── Component ───────────────────────────────────────────────────────────────

export function EditProfilArtisan() {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const userIdNum = parseInt(userId || '0');

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Display data (read-only, same as ProfilArtisan)
    const [categories, setCategories] = useState<ArtisanCategory[]>([]);
    const [reviews, setReviews] = useState<Avis[]>([]);
    const [avisStats, setAvisStats] = useState<AvisStats | null>(null);
    const [photos, setPhotos] = useState<ArtisanPhoto[]>([]);

    // Edit mode
    const [editing, setEditing] = useState(false);

    // Cover crop modal state
    const [coverCropSrc, setCoverCropSrc] = useState<string | null>(null);
    const [showCoverCropModal, setShowCoverCropModal] = useState(false);

    // Editable fields
    const [description, setDescription] = useState('');
    const [poste, setPoste] = useState('');
    const [domaineActivite, setDomaineActivite] = useState('');
    const [adressePro, setAdressePro] = useState('');
    const [codePostal, setCodePostal] = useState('');
    const [_statutDisponibilite, setStatutDisponibilite] = useState(''); // kept for load/save compat
    void _statutDisponibilite;

    // Daily schedule
    const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    type PresetType = 'toute_journee' | 'matin' | 'apres_midi' | 'soiree' | 'personnalise';
    type DayAvailability = { disponible: boolean; preset: PresetType; debut: string; fin: string; horaire: string };
    type WeekSchedule = Record<string, DayAvailability>;

    const PRESETS: { value: PresetType; label: string; debut: string; fin: string }[] = [
        { value: 'toute_journee', label: 'Toute la journée', debut: '00h00', fin: '23h30' },
        { value: 'matin', label: 'Matin (8h - 12h)', debut: '08h00', fin: '12h00' },
        { value: 'apres_midi', label: 'Après-midi (13h - 18h)', debut: '13h00', fin: '18h00' },
        { value: 'soiree', label: 'Soirée (18h - 22h)', debut: '18h00', fin: '22h00' },
        { value: 'personnalise', label: 'Personnalisé', debut: '08h00', fin: '18h00' },
    ];

    const TIME_SLOTS: string[] = [];
    for (let h = 0; h < 24; h++) {
        TIME_SLOTS.push(`${h.toString().padStart(2, '0')}h00`);
        TIME_SLOTS.push(`${h.toString().padStart(2, '0')}h30`);
    }

    const presetToHoraire = (preset: PresetType, debut: string, fin: string): string => {
        switch (preset) {
            case 'toute_journee': return 'Disponible 24h/24';
            case 'matin': return '08h00 - 12h00';
            case 'apres_midi': return '13h00 - 18h00';
            case 'soiree': return '18h00 - 22h00';
            case 'personnalise': return `${debut} - ${fin}`;
        }
    };

    const makeDefaultSchedule = (): WeekSchedule => DAYS.reduce((acc, day) => {
        acc[day] = { disponible: true, preset: 'toute_journee', debut: '00h00', fin: '23h30', horaire: 'Disponible 24h/24' };
        return acc;
    }, {} as WeekSchedule);

    const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>(makeDefaultSchedule());
    const [editCategories, setEditCategories] = useState<ArtisanCategory[]>([]);

    // Category dropdowns
    const [selectedMainCat, setSelectedMainCat] = useState('');
    const [selectedSubCat, setSelectedSubCat] = useState('');
    const [showItemPicker, setShowItemPicker] = useState(false);
    const [itemPickerCatIndex, setItemPickerCatIndex] = useState<number>(-1);

    // Address autocomplete
    const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
    const [showAddressDropdown, setShowAddressDropdown] = useState(false);
    const addressRef = useRef<HTMLDivElement>(null);

    // Photo upload
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);

    // Profile photo
    const [hasProfilePhoto, setHasProfilePhoto] = useState(false);
    const [profilePhotoKey, setProfilePhotoKey] = useState(0); // cache-bust

    // Cover photo (Bannière artisan)
    const [hasCoverPhoto, setHasCoverPhoto] = useState(false);
    const [coverPhotoKey, setCoverPhotoKey] = useState(0); // cache-bust

    // UI
    const [activeTab, setActiveTab] = useState<'presentation' | 'avis' | 'photos'>('presentation');
    const [showVoirTout, setShowVoirTout] = useState(false);

    // ── Load data ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!userId) { navigate('/login'); return; }

        const load = async () => {
            try {
                const [profileData, categoriesData, reviewsData, statsData, photosData, photoMeta, coverMeta] =
                    await Promise.allSettled([
                        fetchUserProfile(userId),
                        fetchArtisanCategories(userId),
                        fetchArtisanAvis(userId, { limit: 50 }),
                        fetchArtisanAvisStats(userId),
                        fetchArtisanPhotos(userId),
                        fetchProfilePhotoMetadata(userId),
                        fetchArtisanCoverPhotoMetadata(userId),
                    ]);
                if (photoMeta.status === 'fulfilled') setHasProfilePhoto(photoMeta.value.has_photo);
                if (coverMeta.status === 'fulfilled') setHasCoverPhoto(coverMeta.value.hasPhotoProfilArtisan);

                if (profileData.status === 'fulfilled') {
                    const p = profileData.value;
                    setProfile(p);
                    setDescription(p.description || '');
                    setPoste(p.poste || '');
                    setDomaineActivite(p.Domaine_activite || '');
                    setAdressePro(p.adresse_professionnelle || '');
                    setCodePostal(p.Code_postal || '');
                    setStatutDisponibilite(p.statut_disponibilite || '');
                    // Parse weekly schedule from statut_disponibilite
                    if (p.statut_disponibilite) {
                        try {
                            const parsed = typeof p.statut_disponibilite === 'string'
                                ? JSON.parse(p.statut_disponibilite)
                                : p.statut_disponibilite;
                            if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed.Lundi !== undefined) {
                                setWeekSchedule(parsed);
                            }
                        } catch { /* keep default schedule */ }
                    }
                }
                if (categoriesData.status === 'fulfilled') {
                    setCategories(categoriesData.value);
                    setEditCategories(categoriesData.value);
                }
                if (reviewsData.status === 'fulfilled') setReviews(reviewsData.value);
                if (statsData.status === 'fulfilled') setAvisStats(statsData.value);
                if (photosData.status === 'fulfilled') setPhotos(photosData.value);
            } catch (err) {
                console.error(err);
                setError('Impossible de charger votre profil');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [userId, navigate]);

    // ── Address autocomplete ──────────────────────────────────────────────────

    useEffect(() => {
        if (adressePro.length < 3 || !editing) {
            setAddressSuggestions([]);
            setShowAddressDropdown(false);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adressePro)}&limit=5`);
                const data = await res.json();
                const suggestions: AddressSuggestion[] = data.features.map(
                    (f: any) => ({ label: f.properties.label, postcode: f.properties.postcode || '', city: f.properties.city || '' })
                );
                setAddressSuggestions(suggestions);
                setShowAddressDropdown(suggestions.length > 0);
            } catch { setAddressSuggestions([]); }
        }, 300);
        return () => clearTimeout(timer);
    }, [adressePro, editing]);

    // Close address dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (addressRef.current && !addressRef.current.contains(e.target as Node)) setShowAddressDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Save profile ──────────────────────────────────────────────────────────

    const handleSave = async () => {
        if (!userId) return;
        setSaving(true); setError(''); setSuccess('');
        try {
            await updateUserProfile(userId, {
                description, poste,
                Domaine_activite: domaineActivite,
                adresse_professionnelle: adressePro,
                Code_postal: codePostal,
                statut_disponibilite: JSON.stringify(weekSchedule),
                tags: editCategories as any,
            });
            setCategories(editCategories);
            setSuccess('Profil mis à jour avec succès !');
            setEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    // ── Cancel editing ────────────────────────────────────────────────────────

    const cancelEdit = () => {
        if (!profile) return;
        setDescription(profile.description || '');
        setPoste(profile.poste || '');
        setDomaineActivite(profile.Domaine_activite || '');
        setAdressePro(profile.adresse_professionnelle || '');
        setCodePostal(profile.Code_postal || '');
        // Restore weekly schedule
        if (profile.statut_disponibilite) {
            try {
                const parsed = typeof profile.statut_disponibilite === 'string'
                    ? JSON.parse(profile.statut_disponibilite)
                    : profile.statut_disponibilite;
                if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed.Lundi !== undefined) {
                    setWeekSchedule(parsed);
                } else {
                    setWeekSchedule(makeDefaultSchedule());
                }
            } catch { setWeekSchedule(makeDefaultSchedule()); }
        } else {
            setWeekSchedule(makeDefaultSchedule());
        }
        setEditCategories(categories);
        setEditing(false);
    };

    // ── Photo management ──────────────────────────────────────────────────────

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !userId) return;
        setUploadingPhoto(true);
        try {
            const result = await uploadArtisanPhoto(userId, e.target.files[0]);
            setPhotos(prev => [...prev, { id: result.id, name: e.target.files![0].name }]);
        } catch (err) { console.error(err); }
        finally { setUploadingPhoto(false); }
    };

    const handleDeletePhoto = async (photoId: number) => {
        if (!userId) return;
        try {
            await deleteArtisanPhoto(photoId, parseInt(userId));
            setPhotos(prev => prev.filter(p => p.id !== photoId));
        } catch (err) { console.error(err); }
    };

    // ── Category management ───────────────────────────────────────────────────

    const addCategory = () => {
        if (!selectedMainCat || !selectedSubCat) return;
        setEditCategories(prev => [...prev, { mainCategory: selectedMainCat, subcategory: selectedSubCat, items: [] }]);
        setSelectedMainCat(''); setSelectedSubCat('');
    };

    const removeCategory = (i: number) => setEditCategories(prev => prev.filter((_, j) => j !== i));

    const addItemToCategory = (catIndex: number, item: string) => {
        setEditCategories(prev => prev.map((cat, i) =>
            i === catIndex && !cat.items.includes(item) ? { ...cat, items: [...cat.items, item] } : cat
        ));
    };

    const removeItemFromCategory = (catIndex: number, itemIndex: number) => {
        setEditCategories(prev => prev.map((cat, i) =>
            i === catIndex ? { ...cat, items: cat.items.filter((_, j) => j !== itemIndex) } : cat
        ));
    };

    // ── Derived data ──────────────────────────────────────────────────────────

    const displayName = profile ? `${profile.Prenom} ${profile.Nom?.charAt(0)}.` : '';
    const displayRating = avisStats?.note_moyenne ?? 0;
    const displayReviewCount = avisStats?.nombre_total ?? 0;
    const displayCategories = editing ? editCategories : categories;
    const sidebarItems = displayCategories.flatMap(c => c.items).slice(0, 7);
    const groupedCategories = displayCategories.reduce<Record<string, { subcategory: string; items: string[] }[]>>((acc, c) => {
        if (!acc[c.mainCategory]) acc[c.mainCategory] = [];
        acc[c.mainCategory].push({ subcategory: c.subcategory, items: c.items });
        return acc;
    }, {});

    const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
        const count = avisStats?.distribution?.[stars] || reviews.filter(r => r.note === stars).length;
        const total = avisStats?.nombre_total || reviews.length;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return { stars, count, pct };
    });

    // ── Loading / Error ───────────────────────────────────────────────────────

    if (loading) return (
        <div className="min-h-screen bg-fixup-white pt-20 flex items-center justify-center">
            <LoadingSpinner message="Chargement du profil..." />
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen bg-fixup-white pt-20 text-center py-20">
            <p className="text-red-500">{error || 'Profil introuvable'}</p>
        </div>
    );

    // ── Render: Stars ─────────────────────────────────────────────────────────

    const renderStars = (rating: number) => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= rating ? 'text-fixup-orange fill-fixup-orange' : 'text-gray-300'}`} />
            ))}
        </div>
    );

    // ── Render: Header (same as ProfilArtisan) ────────────────────────────────

    const onCoverFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                setCoverCropSrc(reader.result as string);
                setShowCoverCropModal(true);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
        // Reset the input so the same file can be selected again if cancelled
        e.target.value = '';
    };

    const handleCoverCropComplete = async (croppedBlob: Blob) => {
        setShowCoverCropModal(false);
        setCoverCropSrc(null);
        if (!userId) return;

        // Convert Blob to File
        const file = new File([croppedBlob], "cover.jpg", { type: "image/jpeg" });

        setUploadingPhoto(true);
        try {
            await uploadArtisanCoverPhoto(userId, file);
            setHasCoverPhoto(true);
            setCoverPhotoKey(prev => prev + 1);
        } catch (err) {
            console.error('Erreur upload couverture recadrée:', err);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const renderHeader = () => (
        <div className="relative mb-0">
            {showCoverCropModal && coverCropSrc && (
                <CoverCropModal
                    imageSrc={coverCropSrc}
                    onClose={() => {
                        setShowCoverCropModal(false);
                        setCoverCropSrc(null);
                    }}
                    onCropComplete={handleCoverCropComplete}
                />
            )}
            <div className="h-48 bg-gray-300 rounded-t-2xl relative overflow-hidden group/cover">
                {hasCoverPhoto ? (
                    <img src={`${getArtisanCoverPhotoUrl(userIdNum)}?v=${coverPhotoKey}`} alt="Couverture" className="w-full h-full object-cover" />
                ) : (
                    <p className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">photo</p>
                )}
                {/* Cover upload button in edit mode */}
                {editing && (
                    <label className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer opacity-0 group-hover/cover:opacity-100 transition-opacity z-10">
                        <div className="flex items-center gap-2 bg-white/90 text-fixup-black rounded-lg px-4 py-2 shadow-md">
                            <Camera className="w-5 h-5" />
                            <span className="text-sm font-medium">{hasCoverPhoto ? 'Changer la couverture' : 'Ajouter une couverture'}</span>
                        </div>
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                            onChange={onCoverFileSelected}
                        />
                    </label>
                )}
                <button
                    onClick={() => setActiveTab('avis')}
                    className="absolute bottom-4 right-4 bg-white rounded-full px-3 py-1.5 shadow-md flex items-center gap-1.5 hover:shadow-lg transition-shadow z-10"
                >
                    <Star className="w-4 h-4 text-fixup-orange fill-fixup-orange" />
                    <span className="text-sm font-bold text-fixup-black">{displayRating.toFixed(1)}/5</span>
                    <span className="text-xs text-fixup-black/50">({displayReviewCount} avis)</span>
                </button>
            </div>

            <div className="bg-white px-8 pb-6 pt-0 relative">
                <div className="absolute -top-12 left-8">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-fixup-orange/10 flex items-center justify-center overflow-hidden relative group">
                        <img
                            src={hasProfilePhoto ? `${getProfilePhotoUrl(userIdNum)}?v=${profilePhotoKey}` : getAvatar(userIdNum)}
                            alt={displayName}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = getAvatar(userIdNum); }}
                        />
                        {/* Upload overlay in edit mode */}
                        {editing && (
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                {uploadingProfilePhoto
                                    ? <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                                    : <Camera className="w-6 h-6 text-white" />
                                }
                                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploadingProfilePhoto}
                                    onChange={async (e) => {
                                        if (!e.target.files?.[0] || !userId) return;
                                        setUploadingProfilePhoto(true);
                                        try {
                                            await uploadProfilePhoto(userId, e.target.files[0]);
                                            setHasProfilePhoto(true);
                                            setProfilePhotoKey(k => k + 1);
                                        } catch (err) { console.error('Erreur upload photo profil:', err); }
                                        finally { setUploadingProfilePhoto(false); }
                                    }}
                                />
                            </label>
                        )}
                        {/* Delete button */}
                        {editing && hasProfilePhoto && (
                            <button
                                onClick={async () => {
                                    if (!userId) return;
                                    try {
                                        await deleteProfilePhoto(userId);
                                        setHasProfilePhoto(false);
                                    } catch (err) { console.error(err); }
                                }}
                                className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                title="Supprimer la photo de profil"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-start justify-between pt-14">
                    <div>
                        {editing ? (
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-fixup-black">{displayName}</h1>
                                <input value={poste} onChange={e => setPoste(e.target.value)} placeholder="Titre / Poste"
                                    className="border border-fixup-blue/20 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-fixup-orange focus:outline-none w-64" />
                                <div ref={addressRef} className="relative">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-fixup-black/40" />
                                        <input value={adressePro} onChange={e => setAdressePro(e.target.value)} placeholder="Adresse professionnelle"
                                            className="border border-fixup-blue/20 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-fixup-orange focus:outline-none w-72" />
                                    </div>
                                    {showAddressDropdown && (
                                        <div className="absolute top-full left-6 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-48 overflow-y-auto">
                                            {addressSuggestions.map((s, i) => (
                                                <button key={i} className="w-full text-left px-4 py-3 text-sm text-fixup-black hover:bg-fixup-green/10 transition-colors border-b border-gray-100 last:border-0"
                                                    onClick={() => {
                                                        setAdressePro(s.label);
                                                        setCodePostal(s.postcode);
                                                        setShowAddressDropdown(false);
                                                    }}>
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold text-fixup-black">{displayName}</h1>
                                <p className="text-sm text-fixup-black/70">{profile.poste || profile.Domaine_activite || ''}</p>
                                <p className="text-sm text-fixup-black/50">{profile.adresse_professionnelle || profile.Adresse || profile.Code_postal || ''}</p>
                            </>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {profile.date_inscription && (
                            <span className="text-xs text-fixup-black/50">
                                Inscrit depuis le {new Date(profile.date_inscription).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        )}
                        {success && <span className="text-xs text-fixup-green font-medium">{success}</span>}
                        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
                        <div className="flex gap-2">
                            {editing ? (
                                <>
                                    <button onClick={cancelEdit}
                                        className="px-4 py-2.5 border-2 border-gray-300 text-fixup-black font-medium rounded-lg hover:bg-gray-100 transition-all duration-200">
                                        Annuler
                                    </button>
                                    <button onClick={handleSave} disabled={saving}
                                        className="px-6 py-2.5 bg-fixup-green text-white font-medium rounded-lg hover:bg-fixup-green/90 transition-all duration-200 flex items-center gap-2 disabled:opacity-50">
                                        <Save className="w-4 h-4" />
                                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setEditing(true)}
                                    className="px-6 py-2.5 bg-fixup-orange text-white font-medium rounded-lg hover:bg-fixup-orange/90 transition-all duration-200 flex items-center gap-2">
                                    <Pencil className="w-4 h-4" />
                                    Modifier les infos
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ── Render: Tabs ──────────────────────────────────────────────────────────

    const renderTabs = () => (
        <div className="bg-white border-b border-gray-200">
            <div className="flex">
                {([
                    { key: 'presentation' as const, label: 'Présentation' },
                    { key: 'avis' as const, label: 'Avis' },
                    { key: 'photos' as const, label: 'Photos' },
                ]).map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-4 text-center font-medium text-sm transition-colors ${activeTab === tab.key ? 'text-fixup-orange border-b-2 border-fixup-orange' : 'text-fixup-black/50 hover:text-fixup-black'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );

    // ── Render: Sidebar (Présentation) ────────────────────────────────────────

    const renderPresentationSidebar = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <img src={handShake} alt="Mises en relation" className="w-10 h-10 object-contain" />
                <div>
                    <p className="text-2xl font-bold text-fixup-black">0</p>
                    <p className="text-sm text-fixup-black/60">mises en relations</p>
                </div>
            </div>

            {sidebarItems.length > 0 && (
                <div>
                    <p className="text-sm font-semibold text-fixup-black mb-3">Répond aux demandes de</p>
                    <div className="flex flex-wrap gap-2">
                        {sidebarItems.map(item => (
                            <span key={item} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-fixup-black border border-gray-200">{item}</span>
                        ))}
                    </div>
                    <button onClick={() => setShowVoirTout(true)}
                        className="mt-3 px-4 py-1.5 border-2 border-fixup-green text-fixup-black text-sm font-medium rounded-full hover:bg-fixup-green/10 transition-colors">
                        Voir tout
                    </button>
                </div>
            )}

            <button className="flex items-center gap-2 text-sm text-fixup-black/40 hover:text-fixup-black/60 transition-colors">
                <Flag className="w-4 h-4" /> Signaler ce profil
            </button>
        </div>
    );

    // ── Render: Presentation content ──────────────────────────────────────────

    const renderPresentationContent = () => (
        <div className="space-y-8">
            {/* Bio */}
            <div className="bg-gray-50 rounded-xl p-6">
                {editing ? (
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} placeholder="Bonjour, je suis un technicien spécialisé en..."
                        className="w-full border border-fixup-blue/20 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-fixup-orange resize-none text-sm bg-white" />
                ) : (
                    <p className="text-sm text-fixup-black whitespace-pre-line leading-relaxed">
                        {description || <span className="text-fixup-black/40 italic">Aucune description renseignée.</span>}
                    </p>
                )}
            </div>

            {/* Edit categories section — only in edit mode */}
            {editing && (
                <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-fixup-black mb-4">Catégories de compétences</h3>

                    {/* Existing categories */}
                    <div className="space-y-3 mb-4">
                        {editCategories.map((cat, catIndex) => (
                            <div key={catIndex} className="bg-white rounded-lg p-4 border border-fixup-blue/20">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mr-2 ${getCategoryColor(cat.mainCategory)}`}>
                                            {cat.mainCategory}
                                        </span>
                                        <span className={`text-sm font-medium ${getCategoryTagColor(cat.mainCategory)}`}>{cat.subcategory}</span>
                                    </div>
                                    <button onClick={() => removeCategory(catIndex)} className="text-red-400 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {cat.items.map((item, itemIndex) => (
                                        <span key={itemIndex} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-fixup-black border flex items-center gap-1">
                                            {item}
                                            <button onClick={() => removeItemFromCategory(catIndex, itemIndex)} className="text-gray-400 hover:text-red-500">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                {/* Item picker from dropdown */}
                                {showItemPicker && itemPickerCatIndex === catIndex ? (
                                    <div className="flex flex-wrap gap-2 p-2 bg-fixup-blue/5 rounded-lg">
                                        <p className="w-full text-xs text-fixup-black/50 mb-1">Cliquez pour ajouter :</p>
                                        {getItems(cat.subcategory).filter(item => !cat.items.includes(item)).map(item => (
                                            <button key={item} onClick={() => addItemToCategory(catIndex, item)}
                                                className="px-3 py-1 bg-white border border-fixup-green/30 rounded-full text-xs text-fixup-green hover:bg-fixup-green/10 transition-colors">
                                                + {item}
                                            </button>
                                        ))}
                                        {getItems(cat.subcategory).filter(item => !cat.items.includes(item)).length === 0 && (
                                            <p className="text-xs text-fixup-black/40">Tous les items sont déjà ajoutés</p>
                                        )}
                                        <button onClick={() => setShowItemPicker(false)}
                                            className="px-3 py-1 bg-gray-200 rounded-full text-xs text-fixup-black">Fermer</button>
                                    </div>
                                ) : (
                                    <button onClick={() => { setShowItemPicker(true); setItemPickerCatIndex(catIndex); }}
                                        className="text-sm text-fixup-blue hover:underline flex items-center gap-1">
                                        <Plus className="w-3 h-3" /> Ajouter des items
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add new category with dropdowns */}
                    <div className="bg-white border-2 border-dashed border-fixup-blue/30 rounded-lg p-4">
                        <p className="text-sm font-medium text-fixup-black mb-3">Ajouter une catégorie</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <select value={selectedMainCat} onChange={e => { setSelectedMainCat(e.target.value); setSelectedSubCat(''); }}
                                className="border border-fixup-blue/20 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-fixup-orange focus:outline-none bg-white">
                                <option value="">-- Catégorie principale --</option>
                                {MAIN_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <select value={selectedSubCat} onChange={e => setSelectedSubCat(e.target.value)} disabled={!selectedMainCat}
                                className="border border-fixup-blue/20 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-fixup-orange focus:outline-none bg-white disabled:opacity-50">
                                <option value="">-- Sous-catégorie --</option>
                                {selectedMainCat && getSubcategories(selectedMainCat).map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={addCategory} disabled={!selectedMainCat || !selectedSubCat}
                            className="px-4 py-2 bg-fixup-blue text-white text-sm rounded-lg hover:bg-fixup-blue/90 disabled:opacity-50 flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Ajouter
                        </button>
                    </div>
                </div>
            )}

            {/* Disponibilités */}
            <div>
                <h3 className="text-lg font-bold text-fixup-black mb-4">Disponibilités</h3>
                {editing ? (
                    <div className="space-y-3">
                        {DAYS.map(day => {
                            const avail = weekSchedule[day] || makeDefaultSchedule()[day];
                            return (
                                <div key={day} className="flex flex-wrap items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                                    {/* Toggle */}
                                    <label className="flex items-center gap-2 w-28 cursor-pointer select-none">
                                        <div
                                            onClick={() => setWeekSchedule(prev => {
                                                const newDispo = !prev[day]?.disponible;
                                                return {
                                                    ...prev,
                                                    [day]: {
                                                        ...prev[day],
                                                        disponible: newDispo,
                                                        horaire: newDispo ? presetToHoraire(prev[day]?.preset || 'toute_journee', prev[day]?.debut || '00h00', prev[day]?.fin || '23h30') : 'Pas disponible'
                                                    }
                                                };
                                            })}
                                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${avail.disponible ? 'bg-fixup-green' : 'bg-gray-300'}`}
                                        >
                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${avail.disponible ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </div>
                                        <span className={`text-sm font-medium ${avail.disponible ? 'text-fixup-black' : 'text-fixup-black/40'}`}>{day}</span>
                                    </label>

                                    {avail.disponible ? (
                                        <div className="flex items-center gap-2 flex-wrap flex-1">
                                            {/* Preset dropdown */}
                                            <select
                                                value={avail.preset || 'toute_journee'}
                                                onChange={e => {
                                                    const preset = e.target.value as PresetType;
                                                    const p = PRESETS.find(pr => pr.value === preset)!;
                                                    setWeekSchedule(prev => ({
                                                        ...prev,
                                                        [day]: {
                                                            ...prev[day],
                                                            preset,
                                                            debut: preset === 'personnalise' ? (prev[day]?.debut || p.debut) : p.debut,
                                                            fin: preset === 'personnalise' ? (prev[day]?.fin || p.fin) : p.fin,
                                                            horaire: presetToHoraire(preset, preset === 'personnalise' ? (prev[day]?.debut || p.debut) : p.debut, preset === 'personnalise' ? (prev[day]?.fin || p.fin) : p.fin)
                                                        }
                                                    }));
                                                }}
                                                className="border border-fixup-blue/20 rounded-lg py-1.5 px-3 text-sm focus:ring-2 focus:ring-fixup-orange focus:outline-none bg-white"
                                            >
                                                {PRESETS.map(p => (
                                                    <option key={p.value} value={p.value}>{p.label}</option>
                                                ))}
                                            </select>

                                            {/* Custom time selectors */}
                                            {avail.preset === 'personnalise' && (
                                                <div className="flex items-center gap-1.5">
                                                    <select
                                                        value={avail.debut}
                                                        onChange={e => setWeekSchedule(prev => ({
                                                            ...prev,
                                                            [day]: { ...prev[day], debut: e.target.value, horaire: `${e.target.value} - ${prev[day].fin}` }
                                                        }))}
                                                        className="border border-fixup-blue/20 rounded-lg py-1.5 px-2 text-sm focus:ring-2 focus:ring-fixup-orange focus:outline-none bg-white"
                                                    >
                                                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                    <span className="text-fixup-black/40 text-sm">→</span>
                                                    <select
                                                        value={avail.fin}
                                                        onChange={e => setWeekSchedule(prev => ({
                                                            ...prev,
                                                            [day]: { ...prev[day], fin: e.target.value, horaire: `${prev[day].debut} - ${e.target.value}` }
                                                        }))}
                                                        className="border border-fixup-blue/20 rounded-lg py-1.5 px-2 text-sm focus:ring-2 focus:ring-fixup-orange focus:outline-none bg-white"
                                                    >
                                                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-red-400 italic">Pas disponible</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
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
                )}
            </div>

            {/* Map */}
            <div className="h-56 rounded-xl overflow-hidden relative z-0">
                <MapContainer center={[47.4784, -0.5632]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[47.4784, -0.5632]} />
                </MapContainer>
            </div>
        </div>
    );

    // ── Render: Avis sidebar ──────────────────────────────────────────────────

    const renderAvisSidebar = () => (
        <div className="space-y-6">
            <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <Star className="w-6 h-6 text-fixup-orange fill-fixup-orange" />
                    <span className="text-3xl font-bold text-fixup-black">{displayRating.toFixed(1)}/5</span>
                </div>
                <p className="text-sm text-fixup-black/50">basé sur {displayReviewCount} avis</p>
            </div>
            <div className="space-y-2">
                {ratingDistribution.map(row => (
                    <div key={row.stars} className="flex items-center gap-2 text-sm">
                        <span className="w-3 text-fixup-black font-medium">{row.stars}</span>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${row.stars >= 4 ? 'bg-fixup-green' : row.stars === 3 ? 'bg-fixup-orange' : 'bg-red-400'}`}
                                style={{ width: `${row.pct}%` }} />
                        </div>
                        <span className="w-10 text-right text-fixup-black/50">{row.pct > 0 ? `${row.pct}%` : '–'}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    // ── Render: Avis content ──────────────────────────────────────────────────

    const renderAvisContent = () => (
        <div className="space-y-6">
            {reviews.length === 0 ? (
                <p className="text-center text-fixup-black/50 py-8">Aucun avis pour le moment.</p>
            ) : reviews.map(review => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-fixup-green/20 flex items-center justify-center">
                                <span className="text-sm font-bold text-fixup-green">{(review.Prenom || '?').charAt(0)}</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-fixup-black">{review.Prenom} {review.Nom?.charAt(0)}.</p>
                                <p className="text-xs text-fixup-black/40">posté le {new Date(review.date_creation).toLocaleDateString('fr-FR')}</p>
                            </div>
                        </div>
                        {renderStars(review.note)}
                    </div>
                    {review.categorie && <p className={`text-xs font-medium mb-2 ${getCategoryTagColor(review.categorie)}`}>{review.categorie}</p>}
                    <p className="text-sm text-fixup-black/80">{review.commentaire}</p>
                </div>
            ))}
        </div>
    );

    // ── Render: Photos tab ────────────────────────────────────────────────────

    const renderPhotosContent = () => (
        <div className="py-8">
            {photos.length === 0 && !editing ? (
                <p className="text-center text-fixup-black/50 py-8">Aucune photo pour le moment.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map(photo => (
                        <div key={photo.id} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                            <img src={getPhotoUrl(photo.id)} alt={photo.name} className="w-full h-full object-cover" />
                            {editing && (
                                <button onClick={() => handleDeletePhoto(photo.id)}
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    {editing && (
                        <label className="aspect-square border-2 border-dashed border-fixup-blue/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-fixup-orange/50 hover:bg-fixup-orange/5 transition-colors">
                            {uploadingPhoto ? (
                                <div className="animate-spin w-8 h-8 border-2 border-fixup-blue border-t-transparent rounded-full" />
                            ) : (
                                <><Camera className="w-8 h-8 text-fixup-black/30 mb-2" /><span className="text-xs text-fixup-black/40">Ajouter</span></>
                            )}
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploadingPhoto} />
                        </label>
                    )}
                </div>
            )}
        </div>
    );

    // ── Modal: Voir tout ──────────────────────────────────────────────────────

    const renderVoirToutModal = () => {
        if (!showVoirTout) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowVoirTout(false)} />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-fixup-black">Répond aux demandes de</h2>
                        <button onClick={() => setShowVoirTout(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                            <X className="w-5 h-5 text-fixup-black/60" />
                        </button>
                    </div>
                    <div className="overflow-y-auto p-6 space-y-6">
                        {Object.entries(groupedCategories).map(([mainCat, subs]) => (
                            <div key={mainCat}>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${getCategoryColor(mainCat)}`}>{mainCat} :</span>
                                {subs.map(sub => (
                                    <div key={sub.subcategory} className="mb-4 ml-1">
                                        <p className="text-sm font-medium text-fixup-black mb-2">{sub.subcategory} :</p>
                                        <div className="flex flex-wrap gap-2">
                                            {sub.items.map(item => (
                                                <span key={item} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-fixup-black border border-gray-200">{item}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // ── Main render ───────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-fixup-white pt-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {renderHeader()}
                    {renderTabs()}

                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-72 border-r border-gray-100 p-6">
                            {activeTab === 'presentation' && renderPresentationSidebar()}
                            {activeTab === 'avis' && renderAvisSidebar()}
                        </div>
                        <div className="flex-1 p-6">
                            {activeTab === 'presentation' && renderPresentationContent()}
                            {activeTab === 'avis' && renderAvisContent()}
                            {activeTab === 'photos' && renderPhotosContent()}
                        </div>
                    </div>
                </div>
            </div>

            {renderVoirToutModal()}
        </div>
    );
}

