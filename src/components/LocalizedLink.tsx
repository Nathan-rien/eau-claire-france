import React from 'react';
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  useNavigate as useRouterNavigate,
  type LinkProps,
  type NavLinkProps,
  type NavigateOptions,
  type To,
} from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizePath } from '@/lib/i18nRoutes';
import type { AppLanguage } from '@/lib/i18nRoutes';

const localizeTo = (to: To, lang: AppLanguage): To => {
  if (typeof to === 'string') return localizePath(to, lang);
  if (to && typeof to === 'object' && typeof to.pathname === 'string') {
    return { ...to, pathname: localizePath(to.pathname, lang) };
  }
  return to;
};

/** Drop-in replacement for react-router's Link that keeps the /en prefix. */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(({ to, ...rest }, ref) => {
  const { language } = useLanguage();
  return <RouterLink ref={ref} to={localizeTo(to, language)} {...rest} />;
});
Link.displayName = 'LocalizedLink';

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(({ to, ...rest }, ref) => {
  const { language } = useLanguage();
  return <RouterNavLink ref={ref} to={localizeTo(to, language)} {...rest} />;
});
NavLink.displayName = 'LocalizedNavLink';

/** Programmatic navigation that preserves the language prefix. */
export const useNavigate = () => {
  const navigate = useRouterNavigate();
  const { language } = useLanguage();
  return React.useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === 'number') return navigate(to);
      return navigate(localizeTo(to, language), options);
    },
    [navigate, language]
  );
};

export default Link;
