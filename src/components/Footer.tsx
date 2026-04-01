
import React from 'react';
import { Droplets } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-8 md:py-12 px-4" role="contentinfo">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center" aria-hidden="true">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold">InfoEau.fr</h2>
            </div>
            <p className="text-gray-400 text-sm">
              {t('footer.description')}
            </p>
          </div>
          
          <nav>
            <h3 className="font-semibold mb-3">{t('footer.data')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/sources" className="hover:text-white transition-colors" rel="nofollow">{t('footer.sources')}</a></li>
              <li><a href="/methodologie" className="hover:text-white transition-colors" rel="nofollow">{t('footer.methodology')}</a></li>
              <li><a href="/api-publique" className="hover:text-white transition-colors" rel="nofollow">{t('footer.publicApi')}</a></li>
              <li><a href="/parcours-eau" className="hover:text-white transition-colors">{t('footer.waterJourney')}</a></li>
            </ul>
          </nav>
          
          <nav>
            <h3 className="font-semibold mb-3">{t('footer.information')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/a-propos" className="hover:text-white transition-colors" rel="nofollow">{t('footer.about')}</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors" rel="nofollow">{t('footer.contact')}</a></li>
              <li><a href="/mentions-legales" className="hover:text-white transition-colors" rel="nofollow">{t('footer.legal')}</a></li>
            </ul>
          </nav>
          
          <nav>
            <h3 className="font-semibold mb-3">{t('footer.compliance')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/rgpd" className="hover:text-white transition-colors" rel="nofollow">{t('footer.gdpr')}</a></li>
              <li><a href="/accessibilite" className="hover:text-white transition-colors" rel="nofollow">{t('footer.accessibility')}</a></li>
              <li><a href="/open-data" className="hover:text-white transition-colors" rel="nofollow">{t('footer.openData')}</a></li>
            </ul>
          </nav>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8 text-center">
          <p className="text-gray-400 text-sm mb-2">
            {t('footer.copyright')}
          </p>
          <p className="text-gray-400 text-sm">
            {t('footer.createdBy')}{' '}
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
