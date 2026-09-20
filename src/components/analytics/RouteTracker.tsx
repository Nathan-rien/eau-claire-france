import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/ga';

/**
 * Envoie un page_view GA4 explicite à chaque changement de route React Router.
 * Le court délai laisse react-helmet-async écrire le <title> avant la mesure,
 * sinon GA4 enregistre le titre de la page précédente.
 *
 * IMPORTANT : désactiver la mesure améliorée « modifications de l'historique
 * du navigateur » dans l'interface GA4, sinon chaque navigation compte double.
 */
export default function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    const id = window.setTimeout(() => {
      trackPageView(`${location.pathname}${location.search}`);
    }, 350);
    return () => window.clearTimeout(id);
  }, [location.pathname, location.search]);

  return null;
}
