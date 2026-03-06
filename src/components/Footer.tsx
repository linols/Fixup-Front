import { Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const isDark = variant === 'dark';
  const bgClass = isDark ? 'bg-gray-300' : 'bg-gray-100';
  const textTitleClass = 'text-fixup-black';
  const textLinkClass = 'text-gray-600 hover:text-fixup-green';
  const borderClass = isDark ? 'border-gray-400' : 'border-gray-300';
  const copyrightTextClass = isDark ? 'text-gray-700' : 'text-gray-600';

  return (
    <footer className={`${bgClass} pt-16 pb-8 px-4 transition-colors`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Navigation */}
          <div>
            <h3 className={`font-semibold text-lg mb-4 ${textTitleClass}`}>Navigation</h3>
            <ul className="space-y-2">
              <li><Link to="/" className={textLinkClass}>Accueil</Link></li>
              <li><Link to="/trouver-artisan" className={textLinkClass}>Trouver un artisan</Link></li>
              <li><Link to="/dashboard" className={textLinkClass}>Espace Particulier</Link></li>
              <li><Link to="/professional-dashboard" className={textLinkClass}>Espace Pro</Link></li>
            </ul>
          </div>

          {/* Découvrir Fixup */}
          <div>
            <h3 className={`font-semibold text-lg mb-4 ${textTitleClass}`}>Découvrir</h3>
            <ul className="space-y-2">
              <li><a href="/#comment-ca-marche" className={textLinkClass}>Comment ça marche ?</a></li>
              <li><a href="/#avis" className={textLinkClass}>Avis clients</a></li>
              <li><Link to="/login" className={textLinkClass}>Connexion / Inscription</Link></li>
              <li><Link to="/messagerie" className={textLinkClass}>Messagerie</Link></li>
              <li><Link to="/pourquoi-reparer-telephone" className={textLinkClass}>Pourquoi réparer son téléphone ?</Link></li>
              <li><Link to="/comment-reparer-ordinateur" className={textLinkClass}>Comment réparer son ordinateur ?</Link></li>
            </ul>
          </div>

          {/* Infos légales */}
          <div>
            <h3 className={`font-semibold text-lg mb-4 ${textTitleClass}`}>Infos légales</h3>
            <ul className="space-y-2">
              <li><Link to="/cgu" className={textLinkClass}>CGU</Link></li>
              <li><Link to="/cgv" className={textLinkClass}>CGV</Link></li>
              <li><Link to="/politique-confidentialite" className={textLinkClass}>Politique de confidentialité</Link></li>
              <li><Link to="/mentions-legales" className={textLinkClass}>Mentions légales</Link></li>
              <li><Link to="/cookies" className={textLinkClass}>Cookies</Link></li>
            </ul>
          </div>

          {/* Retrouvez-nous */}
          <div>
            <h3 className={`font-semibold text-lg mb-4 ${textTitleClass}`}>Retrouvez-nous</h3>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/people/Fixaly-Angers/61588508775335/" target="_blank" rel="noopener noreferrer" className={textLinkClass}>
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://www.instagram.com/fixaly.angers/" target="_blank" rel="noopener noreferrer" className={textLinkClass}>
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className={`text-center text-sm ${copyrightTextClass} pt-8 border-t ${borderClass}`}>
          <p>© {new Date().getFullYear()} Fixup. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}