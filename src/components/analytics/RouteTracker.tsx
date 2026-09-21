import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/ga';

/**
 * Envoie un page_view GA4 explicite à chaque changement de route React Router.
 * Le premier déclenchement est ignoré : gtag envoie déjà automatiquement le
 * page_view de la page d'atterrissage (config sans send_page_view:false),
 * donc l'envoyer ici créerait un doublon.
 * Le court délai laisse react-helmet-async écrire le <title> avant la mesure.
 *
 * IMPORTANT : désactiver la mesure améliorée « modifications de l'historique
 * du navigateur » dans l'interface GA4, sinon chaque navigation compte double.
 */
export default function RouteTracker() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      trackPageView(`${location.pathname}${location.search}`);
    }, 350);
    return () => window.clearTimeout(id);
  }, [location.pathname, location.search]);

  return null;
}
