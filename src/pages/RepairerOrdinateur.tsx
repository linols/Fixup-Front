import { Link } from 'react-router-dom';
import { Monitor, Wrench, Zap, Clock, ArrowRight, ShieldCheck, PiggyBank } from 'lucide-react';

export function RepairerOrdinateur() {
    return (
        <div className="min-h-screen bg-fixup-white pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-fixup-blue/20 mb-6">
                        <Monitor className="w-8 h-8 text-fixup-blue" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-fixup-black mb-4">
                        Comment réparer son ordinateur ?
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Votre PC rame, ne s'allume plus ou fait un bruit bizarre ? Avant de le remplacer, découvrez les solutions simples et les cas où un professionnel peut vous sauver la mise.
                    </p>
                </div>

                {/* Étapes */}
                <div className="space-y-12">

                    {/* Étape 1 */}
                    <section className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-fixup-orange/10 flex items-center justify-center">
                                <span className="text-xl font-bold text-fixup-orange">1</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-fixup-black mb-3">Identifiez le problème</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    La première étape est de comprendre ce qui ne va pas. Voici les symptômes les plus fréquents et leur signification :
                                </p>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {[
                                        { symptome: 'Écran noir au démarrage', cause: 'Alimentation, carte mère ou RAM' },
                                        { symptome: 'PC très lent', cause: 'Disque dur plein ou vieillissant' },
                                        { symptome: 'Bruit de ventilateur fort', cause: 'Poussière ou pâte thermique sèche' },
                                        { symptome: 'Écran bleu (BSOD)', cause: 'Pilotes ou composant défectueux' },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-sm font-semibold text-fixup-black">{item.symptome}</p>
                                            <p className="text-xs text-gray-500 mt-1">→ {item.cause}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Étape 2 */}
                    <section className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-fixup-green/10 flex items-center justify-center">
                                <span className="text-xl font-bold text-fixup-green">2</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-fixup-black mb-3">Ce que vous pouvez faire vous-même</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Certaines opérations simples ne nécessitent pas de compétences techniques avancées :
                                </p>
                                <ul className="mt-4 space-y-2">
                                    {[
                                        'Nettoyer la poussière à l\'intérieur du boîtier avec une bombe à air sec',
                                        'Désinstaller les logiciels inutiles qui ralentissent le démarrage',
                                        'Vérifier que vos pilotes sont à jour via le gestionnaire de périphériques',
                                        'Remplacer un disque dur classique par un SSD pour un gain de vitesse immédiat',
                                    ].map((tip, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                            <Zap className="w-4 h-4 text-fixup-orange flex-shrink-0 mt-0.5" />
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Étape 3 */}
                    <section className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-fixup-blue/10 flex items-center justify-center">
                                <span className="text-xl font-bold text-fixup-blue">3</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-fixup-black mb-3">Quand faire appel à un professionnel ?</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Si le problème persiste ou dépasse vos compétences, un artisan qualifié peut intervenir rapidement. Voici les cas où il vaut mieux confier votre appareil à un expert :
                                </p>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {[
                                        'Remplacement de carte mère ou processeur',
                                        'Récupération de données sur un disque endommagé',
                                        'Diagnostic de pannes électriques complexes',
                                        'Réparation d\'écran de PC portable',
                                    ].map((cas, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-fixup-orange/5 rounded-lg px-4 py-3">
                                            <Wrench className="w-4 h-4 text-fixup-orange flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{cas}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Avantages */}
                    <section className="bg-gradient-to-br from-fixup-blue/5 to-fixup-green/5 rounded-2xl p-8 border border-gray-100">
                        <h2 className="text-xl font-bold text-fixup-black mb-6">Pourquoi passer par Fixup ?</h2>
                        <div className="grid sm:grid-cols-3 gap-6">
                            {[
                                { icon: <Clock className="w-6 h-6 text-fixup-green" />, title: 'Rapide', desc: 'Trouvez un réparateur disponible près de chez vous en quelques clics.' },
                                { icon: <ShieldCheck className="w-6 h-6 text-fixup-blue" />, title: 'Fiable', desc: 'Des artisans vérifiés avec de vrais avis clients.' },
                                { icon: <PiggyBank className="w-6 h-6 text-fixup-orange" />, title: 'Économique', desc: 'Des devis transparents, souvent 3x moins cher qu\'un appareil neuf.' },
                            ].map((item, i) => (
                                <div key={i} className="text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm mb-3">
                                        {item.icon}
                                    </div>
                                    <h3 className="font-bold text-fixup-black mb-1">{item.title}</h3>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center bg-fixup-blue rounded-2xl p-10 shadow-lg">
                    <h2 className="text-2xl font-bold text-fixup-black mb-3">Besoin d'un expert pour votre ordinateur ?</h2>
                    <p className="text-fixup-black/70 mb-6">Ne laissez pas une panne vous gâcher la vie. Nos réparateurs sont là pour vous.</p>
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
