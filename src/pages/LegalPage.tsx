import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, FileText, Lock, Building, Cookie, ChevronRight } from 'lucide-react';

interface Section {
    title: string;
    content: React.ReactNode;
}

interface LegalDoc {
    id: string;
    title: string;
    icon: React.ElementType;
    lastUpdated: string;
    intro: string;
    sections: Section[];
}

const DOCUMENTS: Record<string, LegalDoc> = {
    '/cgu': {
        id: 'cgu',
        title: "Conditions Générales d'Utilisation",
        icon: FileText,
        lastUpdated: '15 Février 2026',
        intro: "Bienvenue sur Fixup. Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de notre plateforme de mise en relation entre particuliers et artisans. En accédant à nos services, vous acceptez sans réserve ces conditions.",
        sections: [
            {
                title: "1. Définitions et Objet",
                content: (
                    <div className="space-y-3">
                        <p><strong>Plateforme :</strong> désigne le site web Fixup, accessible via internet.</p>
                        <p><strong>Utilisateur :</strong> désigne toute personne physique ou morale accédant à la Plateforme.</p>
                        <p><strong>Artisan :</strong> désigne un professionnel enregistré sur la Plateforme proposant ses services.</p>
                        <p>L'objet de ces CGU est de définir les droits et obligations des parties dans le cadre de l'utilisation de la plateforme Fixup.</p>
                    </div>
                )
            },
            {
                title: "2. Accès aux Services",
                content: (
                    <div className="space-y-3">
                        <p>L'accès à la Plateforme est gratuit. Cependant, les prestations convenues entre particuliers et artisans font l'objet d'une tarification indépendante définie entre les deux parties.</p>
                        <p>Fixup s'efforce d'assurer une disponibilité du service 24h/24 et 7j/7, mais se réserve le droit d'interrompre l'accès pour des raisons de maintenance, de sécurité ou en cas de force majeure, sans droit à indemnité.</p>
                    </div>
                )
            },
            {
                title: "3. Engagements et Responsabilité",
                content: (
                    <div className="space-y-3">
                        <p>Fixup agit uniquement en tant qu'intermédiaire technique. Nous ne sommes pas partie prenante aux contrats conclus entre les particuliers et les artisans.</p>
                        <p>En conséquence, notre responsabilité ne saurait être engagée en cas de litige concernant la réalisation, la qualité, ou le paiement des prestations. Les artisans sont seuls responsables des informations publiées sur leur profil.</p>
                        <p>Garanties : Les Utilisateurs s'engagent à fournir des informations exactes lors de leur inscription et à respecter les lois en vigueur lors de la conclusion de contrats via la Plateforme.</p>
                    </div>
                )
            }
        ]
    },
    '/cgv': {
        id: 'cgv',
        title: "Conditions Générales de Vente",
        icon: Shield,
        lastUpdated: '10 Février 2026',
        intro: "Les présentes Conditions Générales de Vente (CGV) s'appliquent entre Fixup (éditeur du service) et tout utilisateur souscrivant à d'éventuels services payants proposés par la plateforme.",
        sections: [
            {
                title: "1. Prestations de service",
                content: (
                    <p>La Plateforme propose un service de conciergerie et de mise en avant (Optionnel). Les prestations de réparation propres ne font pas l'objet de ces CGV, celles-ci étant établies par le devis de l'artisan choisi.</p>
                )
            },
            {
                title: "2. Tarification et Modalités de Paiement",
                content: (
                    <div className="space-y-3">
                        <p>Les prix des services premium optionnels (ex: abonnement compte Professionnel) sont indiqués en Euros, Toutes Taxes Comprises (TTC).</p>
                        <p>Le paiement s'effectue par carte bancaire via un prestataire de paiement sécurisé. Fixup ne stocke aucune donnée bancaire.</p>
                    </div>
                )
            },
            {
                title: "3. Droit de rétractation",
                content: (
                    <p>Conformément à l'article L221-18 du Code de la Consommation, l'internaute dispose d'un délai de 14 jours pour exercer son droit de rétractation, à condition que le service premium n'ait pas été pleinement utilisé ou activé avec l'accord exprès de l'utilisateur.</p>
                )
            }
        ]
    },
    '/politique-confidentialite': {
        id: 'politique-confidentialite',
        title: "Politique de Confidentialité",
        icon: Lock,
        lastUpdated: '1 Mars 2026',
        intro: "La confidentialité de vos données est au cœur de nos priorités. Cette politique détaille la façon dont Fixup collecte, utilise, sauvegarde, et protège vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).",
        sections: [
            {
                title: "1. Types de données collectées",
                content: (
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Données d'identification :</strong> Nom, prénom, adresse e-mail, numéro de téléphone.</li>
                        <li><strong>Données de localisation :</strong> Adresse postale renseignée pour la mise en relation avec des artisans de votre zone.</li>
                        <li><strong>Données professionnelles (Artisans) :</strong> SIRET, domaine d'activité, photos professionnelles.</li>
                        <li><strong>Données de connexion :</strong> Adresse IP, type de navigateur, journaux d'erreurs (logs).</li>
                    </ul>
                )
            },
            {
                title: "2. Finalités du traitement",
                content: (
                    <div className="space-y-3">
                        <p>Vos données sont exploitées pour les finalités suivantes :</p>
                        <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                            <li>Faciliter la mise en relation entre particuliers et artisans.</li>
                            <li>Vous permettre l'accès au service de messagerie interne.</li>
                            <li>Améliorer et optimiser le fonctionnement technique de notre plateforme.</li>
                            <li>Répondre aux obligations légales et prévenir la fraude.</li>
                        </ul>
                    </div>
                )
            },
            {
                title: "3. Vos droits concernant vos données",
                content: (
                    <div className="space-y-3">
                        <p>En vertu du RGPD, vous disposez d'un droit strict d'accès, de rectification, de suppression ("droit à l'oubli"), et d'opposition concernant vos données personnelles.</p>
                        <p className="bg-fixup-blue/10 p-4 rounded-lg border border-fixup-blue/20">
                            Pour exercer vos droits, vous pouvez nous adresser une demande claire via notre formulaire de contact ou par e-mail à : <strong>dpo@fixup-school-project.fr</strong>
                        </p>
                    </div>
                )
            }
        ]
    },
    '/mentions-legales': {
        id: 'mentions-legales',
        title: "Mentions Légales",
        icon: Building,
        lastUpdated: '2 Janvier 2026',
        intro: "Conformément à la Loi pour la Confiance dans l'Économie Numérique (LCEN), voici les informations légales concernant l'éditeur et l'hébergement du site Fixup.",
        sections: [
            {
                title: "1. Éditeur de la Plateforme",
                content: (
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <p className="mb-2"><strong>Nom du Projet :</strong> Fixup</p>
                        <p className="mb-2"><strong>Cadre :</strong> Ce site internet est édité dans le strict cadre d'un <strong>projet scolaire/étudiant</strong>. Il ne possède pas de vocation commerciale réelle ni de statut juridique d'entreprise enregistré.</p>
                        <p className="mb-2"><strong>Adresse administrative fictive :</strong> 1 Rue de l'École, 49000 Angers, France</p>
                        <p><strong>Contact :</strong> contact@fixup-school-project.fr</p>
                    </div>
                )
            },
            {
                title: "2. Hébergement",
                content: (
                    <div className="space-y-3">
                        <p>La Plateforme est hébergée par voie de services Cloud afin d'assurer sa disponibilité continue étudiante.</p>
                        <p><strong>Prestataire principal :</strong> Render / Vercel Inc.</p>
                        <p><strong>Serveurs de bases de données :</strong> AWS / Supabase Infra.</p>
                    </div>
                )
            },
            {
                title: "3. Droits de propriété intellectuelle",
                content: (
                    <p>La conception globale de la Plateforme, les charte graphiques, les logos, textes et éléments UX/UI sont la propriété exclusive des étudiants développeurs de Fixup. Toute reproduction, même partielle, est interdite sans un accord écrit explicite de l'équipe étudiante créatrice.</p>
                )
            }
        ]
    },
    '/cookies': {
        id: 'cookies',
        title: "Politique de Cookies",
        icon: Cookie,
        lastUpdated: '5 Mars 2026',
        intro: "Pour vous offrir la meilleure expérience utilisateur possible, la plateforme Fixup utilise des cookies et d'autres traceurs techniques. Cette charte explique ce qu'ils sont et comment vous pouvez les gérer.",
        sections: [
            {
                title: "Qu'est-ce qu'un cookie ?",
                content: (
                    <p>Un cookie est un petit fichier texte sans danger qui se télécharge sur votre ordinateur, votre téléphone ou votre tablette lorsque vous visitez un site internet. Il nous permet de mémoriser vos paramètres et votre identité entre différentes pages.</p>
                )
            },
            {
                title: "Les cookies que nous utilisons",
                content: (
                    <div className="space-y-4 mt-2">
                        <div className="pl-4 border-l-4 border-fixup-green">
                            <h4 className="font-bold text-gray-900">1. Cookies fonctionnels (Essentiels)</h4>
                            <p className="text-gray-600 text-sm">Ils sont vitaux pour la Plateforme. Ils maintiennent votre session utilisateur active, stockent votre JWT/Token, et conservent votre rôle (Artisan ou Particulier). Ils ne peuvent être désactivés.</p>
                        </div>
                        <div className="pl-4 border-l-4 border-fixup-blue">
                            <h4 className="font-bold text-gray-900">2. Cookies analytiques</h4>
                            <p className="text-gray-600 text-sm">Ces cookies nous aident (via des outils sans partage publicitaire) à analyser la fréquentation du site (nombre de clics, temps passé). Cela nous permet d'améliorer l'expérience.</p>
                        </div>
                    </div>
                )
            }
        ]
    }
};

const MENU_ITEMS = [
    { path: '/cgu', label: "Conditions d'Utilisation", icon: FileText },
    { path: '/cgv', label: "Conditions de Vente", icon: Shield },
    { path: '/politique-confidentialite', label: "Confidentialité & RGPD", icon: Lock },
    { path: '/mentions-legales', label: "Mentions Légales", icon: Building },
    { path: '/cookies', label: "Politique de Cookies", icon: Cookie },
];

export function LegalPage() {
    const location = useLocation();
    const doc = DOCUMENTS[location.pathname] || DOCUMENTS['/mentions-legales'];
    const DocIcon = doc.icon;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Page Header */}
            <div className="bg-fixup-black text-white py-12 px-4 shadow-md">
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4 flex items-center justify-center gap-4">
                        <DocIcon className="w-10 h-10 md:w-12 md:h-12 text-fixup-green" />
                        Espace Légal et Sécurité
                    </h1>
                    <p className="text-gray-300 max-w-2xl text-lg">
                        Transparence, conformité et respect de votre vie privée. Découvrez nos engagements pour vous garantir une expérience sécurisée.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8">

                {/* Sidebar Navigation */}
                <div className="w-full lg:w-1/4 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">
                            Documentation Légale
                        </h3>
                        <nav className="flex flex-col space-y-2">
                            {MENU_ITEMS.map((item) => {
                                const isActive = location.pathname === item.path;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                                ? 'bg-fixup-blue text-white shadow-md font-medium'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-fixup-black'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                            <span className="text-sm">{item.label}</span>
                                        </div>
                                        {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <p className="text-xs text-gray-500 text-center">
                                Un doute ou une question ?<br />
                                <a href="mailto:contact@fixup-school-project.fr" className="text-fixup-blue font-semibold hover:underline mt-1 inline-block">
                                    Contactez l'administration
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="w-full lg:w-3/4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 md:p-12">
                            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-8 mb-8 gap-4">
                                <h2 className="text-3xl font-bold text-fixup-black">
                                    {doc.title}
                                </h2>
                                <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-500 whitespace-nowrap">
                                    Mise à jour : {doc.lastUpdated}
                                </div>
                            </div>

                            <div className="prose prose-lg max-w-none prose-p:text-gray-600 prose-headings:text-fixup-black prose-a:text-fixup-blue">
                                <p className="text-xl leading-relaxed text-gray-800 mb-10 font-medium">
                                    {doc.intro}
                                </p>

                                <div className="space-y-12">
                                    {doc.sections.map((section, idx) => (
                                        <section key={idx} className="scroll-mt-24">
                                            <h3 className="text-2xl font-bold mb-5 flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-lg bg-fixup-green/10 text-fixup-green flex items-center justify-center text-sm">
                                                    {idx + 1}
                                                </span>
                                                {section.title}
                                            </h3>
                                            <div className="text-gray-600 leading-relaxed pl-11">
                                                {section.content}
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div >
    );
}
