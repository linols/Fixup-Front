import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star } from 'lucide-react';

// ─── Category Data ───────────────────────────────────────────────────────────

interface CategoryItem {
    name: string;
    subcategory: string;
    mainCategory: string;
}

const CATEGORIES: CategoryItem[] = [
    // PRODUITS ÉLECTRONIQUES
    // Informatique et Bureautique
    { name: 'Ordinateurs (PC portables, unités centrales, écrans)', subcategory: 'Informatique et Bureautique', mainCategory: 'Produits électroniques' },
    { name: 'Périphériques (écrans de PC, imprimantes, onduleurs, souris)', subcategory: 'Informatique et Bureautique', mainCategory: 'Produits électroniques' },
    // Téléphones et Objets Connectés
    { name: 'Smartphones', subcategory: 'Téléphones et Objets Connectés', mainCategory: 'Produits électroniques' },
    { name: 'Montres connectées', subcategory: 'Téléphones et Objets Connectés', mainCategory: 'Produits électroniques' },
    // Image et Son
    { name: 'Télévisions', subcategory: 'Image et Son', mainCategory: 'Produits électroniques' },
    { name: 'Audio (enceintes Bluetooth, casques audio, appareils audio Hi-Fi)', subcategory: 'Image et Son', mainCategory: 'Produits électroniques' },
    { name: 'Photo (appareils de tous et appareils photo)', subcategory: 'Image et Son', mainCategory: 'Produits électroniques' },

    // GROS ÉLECTROMÉNAGER
    // Appareils de lavage
    { name: 'Lave-linge', subcategory: 'Appareils de lavage', mainCategory: 'Gros électroménager' },
    { name: 'Sèche-linge (à condensation ou pompe à chaleur)', subcategory: 'Appareils de lavage', mainCategory: 'Gros électroménager' },
    { name: 'Lave-vaisselle', subcategory: 'Appareils de lavage', mainCategory: 'Gros électroménager' },
    // Appareils de cuisson
    { name: 'Fours encastrables et cuisinières', subcategory: 'Appareils de cuisson', mainCategory: 'Gros électroménager' },
    { name: 'Plaques de cuisson (induction, vitrocéramique, gaz)', subcategory: 'Appareils de cuisson', mainCategory: 'Gros électroménager' },
    { name: 'Micro-ondes (posables ou encastrés)', subcategory: 'Appareils de cuisson', mainCategory: 'Gros électroménager' },
    { name: 'Hottes aspirantes', subcategory: 'Appareils de cuisson', mainCategory: 'Gros électroménager' },
    // Appareils de froid
    { name: 'Réfrigérateurs (une porte, combinés, américains)', subcategory: 'Appareils de froid', mainCategory: 'Gros électroménager' },
    { name: 'Congélateurs (armoires ou coffres)', subcategory: 'Appareils de froid', mainCategory: 'Gros électroménager' },
    { name: 'Caves à vin', subcategory: 'Appareils de froid', mainCategory: 'Gros électroménager' },

    // PETITS ÉLECTROMÉNAGERS
    // Maison
    { name: 'Aspirateur de maison', subcategory: 'Maison', mainCategory: 'Petit électroménager' },
    { name: 'Aspirateur à main', subcategory: 'Maison', mainCategory: 'Petit électroménager' },
    { name: 'Aspirateur robot', subcategory: 'Maison', mainCategory: 'Petit électroménager' },
    { name: 'Nettoyeurs vapeur et fers à repasser', subcategory: 'Maison', mainCategory: 'Petit électroménager' },
    // Cuisine
    { name: 'Robots pâtissiers et multifonctions', subcategory: 'Cuisine', mainCategory: 'Petit électroménager' },
    { name: 'Blenders, mixeurs plongeants et centrifugeuses', subcategory: 'Cuisine', mainCategory: 'Petit électroménager' },
    { name: 'Friteuses et machines à pain', subcategory: 'Cuisine', mainCategory: 'Petit électroménager' },
    { name: 'Machines à café (capsules, grain, filtre)', subcategory: 'Cuisine', mainCategory: 'Petit électroménager' },
    { name: 'Bouilloires et grille-pains', subcategory: 'Cuisine', mainCategory: 'Petit électroménager' },
    // Salle de bain
    { name: 'Sèche-cheveux, lisseurs/boucleurs', subcategory: 'Salle de bain', mainCategory: 'Petit électroménager' },
    { name: 'Tondeuses et épilateurs', subcategory: 'Salle de bain', mainCategory: 'Petit électroménager' },
    // Jardinage (from screenshot: aspirateur broyeur souffleur)
    { name: 'Aspirateur broyeur souffleur', subcategory: 'Jardinage', mainCategory: 'Gros électroménager' },
    { name: 'Aspirateur de bassin', subcategory: 'Piscines', mainCategory: 'Gros électroménager' },
    { name: 'Aspirateur à eau et poussières', subcategory: 'Travaux', mainCategory: 'Gros électroménager' },
];

// ─── Mock Artisan Data ───────────────────────────────────────────────────────

interface MockArtisan {
    id: number;
    name: string;
    city: string;
    rating: number;
    reviews: number;
    onlineSince: string;
    avatar: string;
}

const MOCK_ARTISANS: MockArtisan[] = [
    { id: 1, name: 'Laurent H.', city: 'Angers (Adeline)', rating: 4.8, reviews: 28, onlineSince: 'En ligne il y a 24 minutes', avatar: '' },
    { id: 2, name: 'Olivier P.', city: 'Notre-Dame-les-Angers (La Venerie)', rating: 3.7, reviews: 3, onlineSince: 'En ligne il y a 48 minutes', avatar: '' },
    { id: 3, name: 'Amine M.', city: 'Angers (Capucins)', rating: 4.8, reviews: 186, onlineSince: 'En ligne à l\'instant', avatar: '' },
];

// ─── Avatar Icons ────────────────────────────────────────────────────────────

const AVATAR_ICONS = [
    '/avatars/avatar-1.svg',
    '/avatars/avatar-2.svg',
    '/avatars/avatar-3.svg',
    '/avatars/avatar-4.svg',
];

const getAvatarForArtisan = (id: number) => AVATAR_ICONS[id % AVATAR_ICONS.length];

// ─── Address Suggestion Interface ────────────────────────────────────────────

interface AddressSuggestion {
    label: string;
    context: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TrouverArtisan() {
    const navigate = useNavigate();
    // Location search state
    const [locationQuery, setLocationQuery] = useState('');
    const [locationSuggestions, setLocationSuggestions] = useState<AddressSuggestion[]>([]);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const locationRef = useRef<HTMLDivElement>(null);

    // Category search state
    const [categoryQuery, setCategoryQuery] = useState('');
    const [filteredCategories, setFilteredCategories] = useState<CategoryItem[]>([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const categoryRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
                setShowLocationDropdown(false);
            }
            if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
                setShowCategoryDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Location autocomplete ────────────────────────────────────────────────

    useEffect(() => {
        if (locationQuery.length < 3) {
            setLocationSuggestions([]);
            setShowLocationDropdown(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(locationQuery)}&limit=5`
                );
                const data = await res.json();
                const suggestions: AddressSuggestion[] = data.features.map(
                    (f: { properties: { label: string; context: string } }) => ({
                        label: f.properties.label,
                        context: f.properties.context,
                    })
                );
                setLocationSuggestions(suggestions);
                setShowLocationDropdown(suggestions.length > 0);
            } catch {
                setLocationSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [locationQuery]);

    // ── Category filtering ───────────────────────────────────────────────────

    useEffect(() => {
        if (categoryQuery.length < 1) {
            setFilteredCategories([]);
            setShowCategoryDropdown(false);
            return;
        }
        const q = categoryQuery.toLowerCase();
        const results = CATEGORIES.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.subcategory.toLowerCase().includes(q) ||
                c.mainCategory.toLowerCase().includes(q)
        );
        setFilteredCategories(results);
        setShowCategoryDropdown(results.length > 0);
    }, [categoryQuery]);

    // ── Render helpers ───────────────────────────────────────────────────────

    const renderArtisanCard = (artisan: MockArtisan) => (
        <div
            key={artisan.id}
            onClick={() => navigate(`/artisan/${artisan.id}`)}
            className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        >
            <div className="p-5">
                {/* Header: avatar + info + rating */}
                <div className="flex items-start gap-3 mb-4">
                    <img
                        src={getAvatarForArtisan(artisan.id)}
                        alt={`Avatar de ${artisan.name}`}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-fixup-black truncate">{artisan.name}</h4>
                        <p className="text-xs text-fixup-black/60 truncate">{artisan.city}</p>
                        <p className="text-xs text-fixup-black/40">{artisan.onlineSince}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="w-4 h-4 text-fixup-orange fill-fixup-orange" />
                        <span className="text-sm font-bold text-fixup-black">{artisan.rating}/5</span>
                        <span className="text-xs text-fixup-black/50">({artisan.reviews} avis)</span>
                    </div>
                </div>

                {/* Placeholder boxes (photos / réparation / phone) */}
                <div className="grid grid-cols-3 gap-2">
                    {['photos', 'réparation', 'phone'].map((label) => (
                        <div
                            key={label}
                            className="bg-gray-100 rounded-lg h-16 flex items-center justify-center"
                        >
                            <span className="text-[10px] text-gray-400 italic">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderCategorySection = (
        title: string,
        profileCount: number,
        artisans: MockArtisan[]
    ) => (
        <section className="mb-16">
            <div className="border-t-2 border-gray-200 pt-8 mb-6">
                <h2 className="text-2xl font-bold text-fixup-black">{title}</h2>
                <p className="text-sm text-fixup-green font-medium mt-1 italic">
                    {profileCount} profils compétents
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artisans.map(renderArtisanCard)}
            </div>

            <div className="flex justify-center mt-8">
                <button className="px-6 py-2.5 border-2 border-fixup-green text-fixup-black text-sm font-medium rounded-full hover:bg-fixup-green/10 transition-colors duration-200">
                    Voir tous les profils
                </button>
            </div>
        </section>
    );

    // ── Main render ──────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-fixup-white pt-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* ── Search Panel ──────────────────────────────────────────────── */}
                <div className="bg-fixup-green rounded-2xl p-8 mb-16 shadow-lg">
                    <h1 className="text-2xl font-bold text-fixup-black mb-6 border-b border-fixup-black/20 pb-3">
                        Trouver un artisan
                    </h1>

                    {/* Par lieu */}
                    <div className="mb-5" ref={locationRef}>
                        <label className="block text-sm font-semibold text-fixup-black mb-2">Par lieu</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                                placeholder="Rechercher"
                                className={`w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fixup-orange focus:border-fixup-orange transition-colors ${locationQuery.length > 0
                                    ? 'text-fixup-black font-normal'
                                    : 'text-gray-400 italic'
                                    }`}
                            />
                            {/* Location dropdown */}
                            {showLocationDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-60 overflow-y-auto">
                                    {locationSuggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            className="w-full text-left px-4 py-3 text-sm text-fixup-black hover:bg-fixup-green/10 transition-colors border-b border-gray-100 last:border-0"
                                            onClick={() => {
                                                setLocationQuery(s.label);
                                                setShowLocationDropdown(false);
                                            }}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Par catégorie */}
                    <div ref={categoryRef}>
                        <label className="block text-sm font-semibold text-fixup-black mb-2">Par catégorie</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={categoryQuery}
                                onChange={(e) => setCategoryQuery(e.target.value)}
                                placeholder="Rechercher"
                                className={`w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fixup-orange focus:border-fixup-orange transition-colors ${categoryQuery.length > 0
                                    ? 'text-fixup-black font-normal'
                                    : 'text-gray-400 italic'
                                    }`}
                            />
                            {/* Category dropdown */}
                            {showCategoryDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-72 overflow-y-auto">
                                    {filteredCategories.map((c, i) => (
                                        <button
                                            key={i}
                                            className="w-full text-left px-4 py-3 text-sm text-fixup-black hover:bg-fixup-green/10 transition-colors border-b border-gray-100 last:border-0"
                                            onClick={() => {
                                                setCategoryQuery(c.name);
                                                setShowCategoryDropdown(false);
                                            }}
                                        >
                                            <span>{c.name}</span>
                                            <span className="text-fixup-black/40 ml-1">
                                                ({c.subcategory} - {c.mainCategory})
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Results Section ───────────────────────────────────────────── */}
                {renderCategorySection('Produits éléctroniques', 40, MOCK_ARTISANS)}
                {renderCategorySection('Gros éléctroménager', 32, MOCK_ARTISANS)}
                {renderCategorySection('Petit éléctroménager', 53, MOCK_ARTISANS)}
            </div>
        </div>
    );
}
