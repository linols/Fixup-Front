import { Star, Quote } from 'lucide-react';

const reviews = [
    {
        id: 1,
        name: 'Sophie M.',
        avatar: 'https://i.pravatar.cc/80?img=47',
        rating: 5,
        job: 'Renovation salle de bain',
        location: 'Paris 11e',
        comment:
            "Artisan tres professionnel, ponctuel et soigneux. Le resultat est impeccable, je recommande vivement !",
        date: 'Janvier 2025',
    },
    {
        id: 2,
        name: 'Thomas R.',
        avatar: 'https://i.pravatar.cc/80?img=12',
        rating: 5,
        job: 'Installation cuisine equipee',
        location: 'Lyon 3e',
        comment:
            "Excellent travail, delais respectes et tarifs competitifs. Notre cuisine est magnifique, merci !",
        date: 'Fevrier 2025',
    },
    {
        id: 3,
        name: 'Camille D.',
        avatar: 'https://i.pravatar.cc/80?img=32',
        rating: 4,
        job: 'Peinture salon & chambre',
        location: 'Bordeaux',
        comment:
            "Tres satisfaite du resultat. L'artisan etait a l'ecoute et de bon conseil pour les couleurs.",
        date: 'Decembre 2024',
    },
    {
        id: 4,
        name: 'Marc L.',
        avatar: 'https://i.pravatar.cc/80?img=57',
        rating: 5,
        job: 'Plomberie & chauffage',
        location: 'Nantes',
        comment:
            "Intervention rapide et efficace. Probleme resolu en moins d'une heure. Je ferai encore appel a ce professionnel.",
        date: 'Novembre 2024',
    },
    {
        id: 5,
        name: 'Julie P.',
        avatar: 'https://i.pravatar.cc/80?img=25',
        rating: 5,
        job: 'Pose de parquet',
        location: 'Marseille 8e',
        comment:
            "Travail de qualite, propre et rapide. L'artisan a su s'adapter a nos contraintes. Parfait !",
        date: 'Octobre 2024',
    },
    {
        id: 6,
        name: 'Antoine B.',
        avatar: 'https://i.pravatar.cc/80?img=68',
        rating: 4,
        job: 'Electricite & mise aux normes',
        location: 'Lille',
        comment:
            "Tres competent, explications claires tout au long du chantier. Je recommande sans hesiter.",
        date: 'Septembre 2024',
    },
];

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? 'fill-[#f25C05] text-[#f25C05]' : 'text-gray-300'
                        }`}
                />
            ))}
        </div>
    );
}

export function ClientReviews() {
    const avgRating = (
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    ).toFixed(1);

    return (
        <div className="bg-gray-50 py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Titre */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl sm:text-4xl font-bold text-fixup-black flex flex-col sm:flex-row items-center justify-center gap-2">
                        <span>Ce que disent nos</span>
                        <div className="relative mx-1">
                            <div className="transform -rotate-2">
                                <span className="absolute inset-0 bg-[#f25C05] -z-10 rounded" />
                                <span className="relative z-10 inline-block px-3 text-white">clients</span>
                            </div>
                        </div>
                    </h2>
                </div>

                {/* Stats globale */}
                <div className="flex items-center justify-center gap-3 mb-16">
                    <span className="text-4xl font-extrabold text-fixup-black">{avgRating}</span>
                    <div>
                        <StarRating rating={5} />
                        <p className="text-sm text-gray-500 mt-1">Base sur {reviews.length} avis verifies</p>
                    </div>
                </div>

                {/* Grille d'avis */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4 transform hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden"
                        >
                            {/* Guillemet decoratif */}
                            <Quote className="absolute top-4 right-4 w-8 h-8 text-[#f25C05]/10" />

                            {/* Header : avatar + nom + etoiles */}
                            <div className="flex items-center gap-3">
                                <img
                                    src={review.avatar}
                                    alt={review.name}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#f25C05]/30"
                                />
                                <div>
                                    <p className="font-semibold text-fixup-black">{review.name}</p>
                                    <StarRating rating={review.rating} />
                                </div>
                            </div>

                            {/* Commentaire */}
                            <p className="text-gray-600 text-sm leading-relaxed flex-1">
                                &ldquo;{review.comment}&rdquo;
                            </p>

                            {/* Footer : metier + date */}
                            <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs text-gray-400">
                                <span className="font-medium text-[#f25C05]">{review.job}</span>
                                <span>{review.date}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <button className="inline-flex items-center px-6 py-3 border-2 border-fixup-green text-fixup-black font-medium rounded-lg hover:bg-fixup-green hover:text-white transition-colors duration-200">
                        Voir tous les avis
                    </button>
                </div>
            </div>
        </div>
    );
}
