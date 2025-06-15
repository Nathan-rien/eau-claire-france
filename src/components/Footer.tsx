
import React from 'react';
import { Droplets } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-lg font-bold">InfoEau.fr</h4>
            </div>
            <p className="text-gray-400 text-sm">
              Plateforme citoyenne de transparence sur la qualité de l'eau potable en France.
            </p>
          </div>
          
          <div>
            <h5 className="font-semibold mb-3">Données</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Sources</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Méthodologie</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API publique</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-3">Informations</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-3">Conformité</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">RGPD</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Accessibilité</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Open Data</a></li>
            </ul>
          </div>
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
