import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-100 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Questions fréquentes */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-fixup-black">Questions fréquentes</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">Comment ça marche ?</a></li>
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">Tarifs et paiements</a></li>
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">Garanties</a></li>
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">Assurances</a></li>
            </ul>
          </div>

          {/* Présentation */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-fixup-black">Présentation</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">Qui sommes-nous ?</a></li>
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">Notre mission</a></li>
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">Nos valeurs</a></li>
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">Recrutement</a></li>
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">Contact</a></li>
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">Presse</a></li>
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">Partenaires</a></li>
            </ul>
          </div>

          {/* Infos légales */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-fixup-black">Infos légales</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">CGU</a></li>
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">CGV</a></li>
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">Politique de confidentialité</a></li>
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">Mentions légales</a></li>
              <li><a href="#" className="text-gray-600 hover:text-fixup-green">Cookies</a></li>
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
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-fixup-green">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-fixup-green">
                <Youtube className="w-6 h-6" />
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