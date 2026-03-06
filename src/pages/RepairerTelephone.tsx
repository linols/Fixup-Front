import { Link } from 'react-router-dom';
import { Smartphone, ShieldCheck, Leaf, PiggyBank, ArrowRight } from 'lucide-react';

export function RepairerTelephone() {
    return (
        <div className="min-h-screen bg-fixup-white pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-fixup-green/20 mb-6">
                        <Smartphone className="w-8 h-8 text-fixup-green" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-fixup-black mb-4">
                        Pourquoi réparer son téléphone ?
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Chaque année, des millions de smartphones finissent à la poubelle alors qu'ils pourraient facilement être réparés. Découvrez pourquoi la réparation est le choix le plus malin.
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-12">

                    {/* Raison 1 */}
                    <section className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-fixup-orange/10 flex items-center justify-center">
                                <PiggyBank className="w-6 h-6 text-fixup-orange" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-fixup-black mb-3">Économisez jusqu'à 70%</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Un écran de smartphone neuf coûte en moyenne entre 50 € et 150 € à remplacer, contre 800 € à 1 200 € pour un téléphone neuf. La réparation vous permet de garder votre appareil préféré tout en préservant votre budget. Sur Fixup, nos artisans locaux proposent des tarifs justes et transparents.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Raison 2 */}
                    <section className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-fixup-green/10 flex items-center justify-center">
                                <Leaf className="w-6 h-6 text-fixup-green" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-fixup-black mb-3">Un geste pour la planète</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    La fabrication d'un smartphone génère environ 70 kg de CO₂. En réparant au lieu de remplacer, vous réduisez considérablement votre empreinte carbone. C'est aussi lutter contre l'extraction de métaux rares et les déchets électroniques qui polluent nos sols et nos océans.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Raison 3 */}
                    <section className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-fixup-blue/10 flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-fixup-blue" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-fixup-black mb-3">Conservez vos données et habitudes</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Changer de téléphone, c'est souvent perdre du temps à tout reconfigurer, transférer ses données, ses applications, ses mots de passe. En réparant, vous gardez votre appareil tel quel, avec toutes vos photos, contacts et applications déjà installées. Zéro stress.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Pannes courantes */}
                    <section className="bg-gradient-to-br from-fixup-green/5 to-fixup-blue/5 rounded-2xl p-8 border border-gray-100">
                        <h2 className="text-xl font-bold text-fixup-black mb-6">Les pannes les plus courantes</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                'Écran fissuré ou cassé',
                                'Batterie qui ne tient plus la charge',
                                'Connecteur de charge défectueux',
                                'Haut-parleur ou micro en panne',
                                'Bouton d\'allumage bloqué',
                                'Caméra qui ne fonctionne plus',
                            ].map((panne, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm">
                                    <span className="w-2 h-2 bg-fixup-orange rounded-full flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{panne}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center bg-fixup-green rounded-2xl p-10 shadow-lg">
                    <h2 className="text-2xl font-bold text-fixup-black mb-3">Prêt à donner une seconde vie à votre téléphone ?</h2>
                    <p className="text-fixup-black/70 mb-6">Trouvez un réparateur de confiance près de chez vous en quelques clics.</p>
                    <Link
                        to="/trouver-artisan"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-fixup-orange text-white font-semibold rounded-lg shadow-md hover:bg-fixup-orange/90 transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Trouver un artisan
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
