
import React from 'react';
import { Droplets } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4" role="contentinfo">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center" aria-hidden="true">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold">InfoEau.fr</h2>
            </div>
            <p className="text-gray-400 text-sm">
              Plateforme citoyenne de transparence sur la qualité de l'eau potable en France et en Europe.
            </p>
          </div>
          
          <nav>
            <h3 className="font-semibold mb-3">Données</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/sources" className="hover:text-white transition-colors" rel="nofollow">Sources</a></li>
              <li><a href="/methodologie" className="hover:text-white transition-colors" rel="nofollow">Méthodologie</a></li>
              <li><a href="/api-publique" className="hover:text-white transition-colors" rel="nofollow">API publique</a></li>
            </ul>
          </nav>
          
          <nav>
            <h3 className="font-semibold mb-3">Informations</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/a-propos" className="hover:text-white transition-colors" rel="nofollow">À propos</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors" rel="nofollow">Contact</a></li>
              <li><a href="/mentions-legales" className="hover:text-white transition-colors" rel="nofollow">Mentions légales</a></li>
            </ul>
          </nav>
          
          <nav>
            <h3 className="font-semibold mb-3">Conformité</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/rgpd" className="hover:text-white transition-colors" rel="nofollow">RGPD</a></li>
              <li><a href="/accessibilite" className="hover:text-white transition-colors" rel="nofollow">Accessibilité</a></li>
              <li><a href="/open-data" className="hover:text-white transition-colors" rel="nofollow">Open Data</a></li>
            </ul>
          </nav>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8 text-center">
          <p className="text-gray-400 text-sm mb-2">
            © 2024 InfoEau.fr - Données basées sur les sources officielles ARS, EauFrance, BRGM
          </p>
          <p className="text-gray-400 text-sm">
            Créé par{' '}
            <a 
              href="https://www.linkedin.com/in/nathan-orso-bdx/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Nathan Orso
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
