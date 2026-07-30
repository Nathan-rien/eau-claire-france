import { Navigate, useLocation } from 'react-router-dom';

/**
 * Les anciennes URLs /en/... n'existent pas : la langue est gérée par contexte,
 * pas par le chemin. On redirige vers l'équivalent français plutôt que de
 * renvoyer une 404 en noindex (source de pages "Exclue par la balise noindex").
 */
const EnRedirect = () => {
  const location = useLocation();
  const target = location.pathname.replace(/^\/en(\/|$)/, '/') || '/';
  return <Navigate to={`${target}${location.search}`} replace />;
};

export default EnRedirect;
