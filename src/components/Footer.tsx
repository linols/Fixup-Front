import { Facebook, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-100 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-fixup-black">Navigation</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 hover:text-fixup-green">Accueil</Link></li>
              <li><Link to="/trouver-artisan" className="text-gray-600 hover:text-fixup-green">Trouver un artisan</Link></li>
              <li><Link to="/dashboard" className="text-gray-600 hover:text-fixup-green">Espace Particulier</Link></li>
              <li><Link to="/professional-dashboard" className="text-gray-600 hover:text-fixup-green">Espace Pro</Link></li>
            </ul>
          </div>

          {/* Découvrir Fixup */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-fixup-black">Découvrir</h3>
            <ul className="space-y-2">
              <li><a href="/#comment-ca-marche" className="text-gray-600 hover:text-fixup-green">Comment ça marche ?</a></li>
              <li><a href="/#avis" className="text-gray-600 hover:text-fixup-green">Avis clients</a></li>
              <li><Link to="/login" className="text-gray-600 hover:text-fixup-green">Connexion / Inscription</Link></li>
              <li><Link to="/messagerie" className="text-gray-600 hover:text-fixup-green">Messagerie</Link></li>
            </ul>
          </div>

          {/* Infos légales */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-fixup-black">Infos légales</h3>
            <ul className="space-y-2">
              <li><Link to="/cgu" className="text-gray-600 hover:text-fixup-green">CGU</Link></li>
              <li><Link to="/cgv" className="text-gray-600 hover:text-fixup-green">CGV</Link></li>
              <li><Link to="/politique-confidentialite" className="text-gray-600 hover:text-fixup-green">Politique de confidentialité</Link></li>
              <li><Link to="/mentions-legales" className="text-gray-600 hover:text-fixup-green">Mentions légales</Link></li>
              <li><Link to="/cookies" className="text-gray-600 hover:text-fixup-green">Cookies</Link></li>
            </ul>
          </div>

          {/* Retrouvez-nous */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-fixup-black">Retrouvez-nous</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-fixup-green">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-fixup-green">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-fixup-green">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-600 pt-8 border-t border-gray-300">
          <p>© {new Date().getFullYear()} Fixup. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}