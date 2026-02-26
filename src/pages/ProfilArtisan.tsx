import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Heart, Flag, X, Camera } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon (Leaflet + webpack/vite issue)
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// ─── Mock Data ───────────────────────────────────────────────────────────────

interface ArtisanProfile {
    id: number;
    name: string;
    title: string;
    city: string;
    onlineStatus: string;
    registeredSince: string;
    rating: number;
    reviewCount: number;
    misesEnRelation: number;
    bio: string;
    disponibilites: { jour: string; horaire: string }[];
    categories: {
        mainCategory: string;
        subcategory: string;
        items: string[];
    }[];
}

interface Review {
    id: number;
    author: string;
    date: string;
    rating: number;
    category: string;
    mainCategory: string;
    text: string;
    artisanResponse?: string;
}

const MOCK_PROFILE: ArtisanProfile = {
    id: 1,
    name: 'Joseph G.',
    title: 'Technicien',
    city: 'Angers (Croix Blanche)',
    onlineStatus: 'En ligne il y a 2 heures',
    registeredSince: '23 décembre 2025',
    rating: 4.9,
    reviewCount: 68,
    misesEnRelation: 184,
    bio: `« Bonjour,
Homme de 48 ans aimant bricolage, cuisine et jardinage, disponible en complément de mon travail le soir et le week-end. Je peux réparer beaucoup d'appareils électroniques différents et quelques gros électroménagers.
Mon tarif est 15 euros de l'heure pour 1 travail en journée continue, la première intervention est elle à 25 euros. »`,
    disponibilites: [
        { jour: 'Lundi', horaire: 'Disponible 24h/24' },
        { jour: 'Mardi', horaire: '17h00 – 22h00' },
        { jour: 'Mercredi', horaire: 'Pas disponible' },
        { jour: 'Jeudi', horaire: '17h00 – 22h00' },
        { jour: 'Vendredi', horaire: '18h00 – 21h00' },
        { jour: 'Samedi', horaire: 'Disponible 24h/24' },
        { jour: 'Dimanche', horaire: 'Disponible 24h/24' },
    ],
    categories: [
        {
            mainCategory: 'Produits électroniques',
            subcategory: 'Informatique et Bureautique',
            items: ['PC portable', 'Unités centrales', 'Tablettes', 'Ecrans de PC'],
        },
        {
            mainCategory: 'Produits électroniques',
            subcategory: 'Téléphonie et objets connectés',
            items: ['Smartphones', 'Montres connectées'],
        },
        {
            mainCategory: 'Produits électroniques',
            subcategory: 'Audio et son',
            items: ['Téléviseurs'],
        },
        {
            mainCategory: 'Produits électroniques',
            subcategory: 'Loisirs',
            items: ['Consoles de jeux', 'Appareils photo'],
        },
        {
            mainCategory: 'Gros électroménagers',
            subcategory: 'Appareils de lavage',
            items: ['Lave-vaisselles'],
        },
        {
            mainCategory: 'Gros électroménagers',
            subcategory: 'Appareils de cuisson',
            items: ['Micro-ondes posables', 'Micro-ondes encastrés'],
        },
        {
            mainCategory: 'Petits électroménagers',
            subcategory: 'Cuisine',
            items: ['Machines à café (capsules)', 'Grille-pains'],
        },
    ],
};

const MOCK_REVIEWS: Review[] = [
    {
        id: 1,
        author: 'Scott J.',
        date: '7 février 2026',
        rating: 5,
        category: 'Informatique et Bureautique',
        mainCategory: 'Produits électroniques',
        text: 'Travail soigné, efficace et une bonne communication. Je recommande.',
        artisanResponse: 'Merci beaucoup Scott :)',
    },
    {
        id: 2,
        author: 'Marine P.',
        date: '12 décembre 2025',
        rating: 1,
        category: 'Appareils de lavage',
        mainCategory: 'Gros électroménagers',
        text: 'beaucoup trop cher',
        artisanResponse: 'Madame on viens à peine de discuter pour les tarifs vous étiez d\'accord et là vous me mettez un mauvais avis...',
    },
    {
        id: 3,
        author: 'Thomas L.',
        date: '28 novembre 2025',
        rating: 5,
        category: 'Téléphonie et objets connectés',
        mainCategory: 'Produits électroniques',
        text: 'Réparation rapide de mon smartphone, écran changé en 30 minutes. Excellent service !',
    },
    {
        id: 4,
        author: 'Claire D.',
        date: '15 novembre 2025',
        rating: 4,
        category: 'Cuisine',
        mainCategory: 'Petits électroménagers',
        text: 'Machine à café réparée correctement. Un peu long pour avoir un rdv mais bon travail.',
        artisanResponse: 'Merci Claire, désolé pour l\'attente, je fais de mon mieux !',
    },
    {
        id: 5,
        author: 'Paul R.',
        date: '2 novembre 2025',
        rating: 5,
        category: 'Loisirs',
        mainCategory: 'Produits électroniques',
        text: 'Console PS5 réparée nickel. Merci Joseph !',
    },
];

// ─── Helper: color per main category ─────────────────────────────────────────

const getCategoryColor = (mainCat: string) => {
    switch (mainCat) {
        case 'Produits électroniques':
            return 'bg-fixup-green text-white';
        case 'Gros électroménagers':
            return 'bg-fixup-orange text-white';
        case 'Petits électroménagers':
            return 'bg-fixup-blue text-white';
        default:
            return 'bg-gray-200 text-fixup-black';
    }
};

const getCategoryTagColor = (mainCat: string) => {
    switch (mainCat) {
        case 'Produits électroniques':
            return 'text-fixup-green';
        case 'Gros électroménagers':
            return 'text-fixup-orange';
        case 'Petits électroménagers':
            return 'text-fixup-blue';
        default:
            return 'text-gray-500';
    }
};

// ─── Avatar Icons ────────────────────────────────────────────────────────────

const AVATAR_ICONS = [
    '/avatars/avatar-1.svg',
    '/avatars/avatar-2.svg',
    '/avatars/avatar-3.svg',
    '/avatars/avatar-4.svg',
];

const getAvatar = (id: number) => AVATAR_ICONS[id % AVATAR_ICONS.length];

// ─── Component ───────────────────────────────────────────────────────────────

export function ProfilArtisan() {
    const { id } = useParams<{ id: string }>();
    const artisanId = parseInt(id || '1');
    const profile = MOCK_PROFILE; // In real app: fetch by artisanId

    const [activeTab, setActiveTab] = useState<'presentation' | 'avis' | 'photos'>('presentation');
    const [showVoirTout, setShowVoirTout] = useState(false);
    const [showFiltre, setShowFiltre] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showDemande, setShowDemande] = useState(false);
    const [demandeDescription, setDemandeDescription] = useState('');
    const [demandeAdresse, setDemandeAdresse] = useState('');

    // Filter state for reviews
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const [allCategoriesChecked, setAllCategoriesChecked] = useState(true);

    // Get unique categories that have reviews
    const reviewCategories = MOCK_REVIEWS.reduce<{ mainCategory: string; subcategory: string }[]>(
        (acc, r) => {
            if (!acc.find((c) => c.subcategory === r.category)) {
                acc.push({ mainCategory: r.mainCategory, subcategory: r.category });
            }
            return acc;
        },
        []
    );

    // Group review categories by main category
    const groupedReviewCategories = reviewCategories.reduce<
        Record<string, string[]>
    >((acc, c) => {
        if (!acc[c.mainCategory]) acc[c.mainCategory] = [];
        acc[c.mainCategory].push(c.subcategory);
        return acc;
    }, {});

    // Filtered reviews
    const filteredReviews =
        allCategoriesChecked || selectedFilters.length === 0
            ? MOCK_REVIEWS
            : MOCK_REVIEWS.filter((r) => selectedFilters.includes(r.category));

    // Rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
        const count = MOCK_REVIEWS.filter((r) => r.rating === stars).length;
        const pct = MOCK_REVIEWS.length > 0 ? Math.round((count / MOCK_REVIEWS.length) * 100) : 0;
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
    const sidebarItems = profile.categories.flatMap((c) => c.items).slice(0, 7);

    // Group all categories by main category for "Voir tout"
    const groupedCategories = profile.categories.reduce<
        Record<string, { subcategory: string; items: string[] }[]>
    >((acc, c) => {
        if (!acc[c.mainCategory]) acc[c.mainCategory] = [];
        acc[c.mainCategory].push({ subcategory: c.subcategory, items: c.items });
        return acc;
    }, {});

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
            <div className="h-48 bg-gray-300 rounded-t-2xl relative">
                <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="absolute top-4 left-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                    <Heart
                        className={`w-5 h-5 ${isFavorite
                            ? 'text-red-500 fill-red-500'
                            : 'text-fixup-orange'
                            }`}
                    />
                </button>
                <p className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                    photo
                </p>

                {/* Rating badge */}
                <button
                    onClick={() => setActiveTab('avis')}
                    className="absolute bottom-4 right-4 bg-white rounded-full px-3 py-1.5 shadow-md flex items-center gap-1.5 hover:shadow-lg transition-shadow"
                >
                    <Star className="w-4 h-4 text-fixup-orange fill-fixup-orange" />
                    <span className="text-sm font-bold text-fixup-black">
                        {profile.rating}/5
                    </span>
                    <span className="text-xs text-fixup-black/50">
                        ({profile.reviewCount} avis)
                    </span>
                </button>
            </div>

            {/* Profile info row */}
            <div className="bg-white px-8 pb-6 pt-0 relative">
                {/* Avatar */}
                <div className="absolute -top-12 left-8">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-fixup-orange/10 flex items-center justify-center overflow-hidden">
                        <img
                            src={getAvatar(artisanId)}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="flex items-start justify-between pt-14">
                    <div>
                        <h1 className="text-2xl font-bold text-fixup-black">
                            {profile.name}
                        </h1>
                        <p className="text-sm text-fixup-black/70">{profile.title}</p>
                        <p className="text-sm text-fixup-black/50">{profile.city}</p>
                        <p className="text-xs text-fixup-black/40">{profile.onlineStatus}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-fixup-black/50">
                            Inscrit depuis le {profile.registeredSince}
                        </span>
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
        <div className="space-y-6">
            {/* Mises en relation */}
            <div className="flex items-center gap-3">
                <div className="text-2xl">📡</div>
                <div>
                    <p className="text-2xl font-bold text-fixup-black">
                        {profile.misesEnRelation}
                    </p>
                    <p className="text-sm text-fixup-black/60">mises en relations</p>
                </div>
            </div>

            {/* Category tags */}
            <div>
                <p className="text-sm font-semibold text-fixup-black mb-3">
                    Répond aux demandes de
                </p>
                <div className="flex flex-wrap gap-2">
                    {sidebarItems.map((item) => (
                        <span
                            key={item}
                            className="px-3 py-1 bg-gray-100 rounded-full text-xs text-fixup-black border border-gray-200"
                        >
                            {item}
                        </span>
                    ))}
                </div>
                <button
                    onClick={() => setShowVoirTout(true)}
                    className="mt-3 px-4 py-1.5 border-2 border-fixup-green text-fixup-black text-sm font-medium rounded-full hover:bg-fixup-green/10 transition-colors"
                >
                    Voir tout
                </button>
            </div>

            {/* Signaler */}
            <button className="flex items-center gap-2 text-sm text-fixup-black/40 hover:text-fixup-black/60 transition-colors">
                <Flag className="w-4 h-4" />
                Signaler ce profil
            </button>
        </div>
    );

    // ── Render: Content (Présentation) ───────────────────────────────────────

    const renderPresentationContent = () => (
        <div className="space-y-8">
            {/* Bio */}
            <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-sm text-fixup-black whitespace-pre-line leading-relaxed">
                    {profile.bio}
                </p>
            </div>

            {/* Disponibilités */}
            <div>
                <h3 className="text-lg font-bold text-fixup-black mb-4">Disponibilités</h3>
                <div className="space-y-2">
                    {profile.disponibilites.map((d) => (
                        <div key={d.jour} className="flex items-center text-sm">
                            <span className="w-28 font-medium text-fixup-black">
                                {d.jour} :
                            </span>
                            <span
                                className={`${d.horaire === 'Pas disponible'
                                    ? 'text-fixup-black/40'
                                    : 'text-fixup-black/70'
                                    }`}
                            >
                                {d.horaire}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map */}
            <div className="h-56 rounded-xl overflow-hidden relative z-0">
                <MapContainer
                    center={[47.4784, -0.5632]}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
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
                        {profile.rating}/5
                    </span>
                </div>
                <p className="text-sm text-fixup-black/50">
                    basé sur {profile.reviewCount} avis
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
            {filteredReviews.map((review) => (
                <div
                    key={review.id}
                    className="border-b border-gray-100 pb-6 last:border-0"
                >
                    {/* Review header */}
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-fixup-green/20 flex items-center justify-center">
                                <span className="text-sm font-bold text-fixup-green">
                                    {review.author.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-fixup-black">
                                    {review.author}
                                </p>
                                <p className="text-xs text-fixup-black/40">
                                    posté le {review.date}
                                </p>
                            </div>
                        </div>
                        {renderStars(review.rating)}
                    </div>

                    {/* Category tag */}
                    <p
                        className={`text-xs font-medium mb-2 ${getCategoryTagColor(
                            review.mainCategory
                        )}`}
                    >
                        {review.mainCategory}
                    </p>

                    {/* Review text */}
                    <p className="text-sm text-fixup-black/80 mb-3">{review.text}</p>

                    {/* Artisan response */}
                    {review.artisanResponse && (
                        <div className="ml-8 pl-4 border-l-2 border-fixup-orange/30">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-fixup-orange/20 flex items-center justify-center">
                                    <span className="text-xs font-bold text-fixup-orange">
                                        {profile.name.charAt(0)}
                                    </span>
                                </div>
                                <p className="font-bold text-sm text-fixup-black">
                                    {profile.name}
                                </p>
                            </div>
                            <p className="text-sm text-fixup-black/70">
                                {review.artisanResponse}
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    // ── Render: Photos tab ───────────────────────────────────────────────────

    const renderPhotosContent = () => (
        <div className="py-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center"
                    >
                        <p className="text-sm text-gray-400 italic">Photo {i}</p>
                    </div>
                ))}
            </div>
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
                                {/* Main category badge */}
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${getCategoryColor(
                                        mainCat
                                    )}`}
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
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div>
                            <h2 className="text-lg font-bold text-fixup-black">Filtres</h2>
                            <p className="text-xs text-fixup-black/50 mt-1">
                                Comprend uniquement les catégories ayant reçues un avis sur une prestation
                            </p>
                        </div>
                        <button
                            onClick={() => setShowFiltre(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-fixup-black/60" />
                        </button>
                    </div>

                    {/* Scrollable content */}
                    <div className="overflow-y-auto p-6 space-y-4">
                        {/* All categories */}
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
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${getCategoryColor(
                                        mainCat
                                    )}`}
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
                                            checked={
                                                allCategoriesChecked ||
                                                selectedFilters.includes(sub)
                                            }
                                            onChange={() => toggleFilter(sub)}
                                            className="w-4 h-4 accent-fixup-green"
                                        />
                                        <span className="text-sm text-fixup-black">{sub}</span>
                                    </label>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
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
                    {/* Header */}
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

                    {/* Content */}
                    <div className="overflow-y-auto p-6 space-y-6">
                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-fixup-black mb-2">
                                Décrivez votre besoin
                            </label>
                            <textarea
                                value={demandeDescription}
                                onChange={(e) => setDemandeDescription(e.target.value)}
                                placeholder="Bonjour,"
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-fixup-black placeholder:text-fixup-black/30 focus:outline-none focus:border-fixup-orange focus:ring-1 focus:ring-fixup-orange resize-none"
                            />
                        </div>

                        {/* Photos */}
                        <div>
                            <label className="block text-sm font-medium text-fixup-black mb-1">
                                Ajoutez des photos
                            </label>
                            <p className="text-xs text-fixup-black/50 mb-3">
                                Cela aidera l'artisan à mieux se projeter sur votre demande
                            </p>
                            <div className="flex gap-3">
                                {[1, 2, 3].map((i) => (
                                    <button
                                        key={i}
                                        className="w-20 h-20 border-2 border-gray-200 rounded-xl flex items-center justify-center hover:border-fixup-orange/50 hover:bg-fixup-orange/5 transition-colors"
                                    >
                                        <Camera className="w-6 h-6 text-fixup-black/30" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Adresse */}
                        <div>
                            <label className="block text-sm font-medium text-fixup-black mb-2">
                                Adresse
                            </label>
                            <input
                                type="text"
                                value={demandeAdresse}
                                onChange={(e) => setDemandeAdresse(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-fixup-black placeholder:text-fixup-black/30 focus:outline-none focus:border-fixup-orange focus:ring-1 focus:ring-fixup-orange"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100">
                        <button
                            onClick={() => setShowDemande(false)}
                            className="w-full py-2.5 bg-fixup-orange text-white text-sm font-medium rounded-full hover:bg-fixup-green transition-all duration-200"
                        >
                            Envoyer la demande
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Main render ──────────────────────────────────────────────────────────

    // Suppress unused variable warning for artisanId used in avatar
    void artisanId;

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
