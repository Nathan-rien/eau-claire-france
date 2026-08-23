export interface SiteAlert {
  id: string;
  title: string;
  status: 'active' | 'resolved';
  articleSlug: string;
  publishedAt: string; // ISO date
  displayUntil?: string; // ISO date (optional)
  /** Defaults to true when absent: the alert can be dismissed and stays dismissed. */
  dismissible?: boolean;
}

export const SITE_ALERTS: SiteAlert[] = [
  {
    id: 'uranium-eau-savoie-aout-2026',
    title:
      "Uranium dans l'eau du robinet en Savoie : 3 communes de Maurienne concernées — cliquez pour voir toutes les infos",
    status: 'active',
    articleSlug: 'uranium-eau-robinet-savoie-maurienne-aout-2026',
    publishedAt: '2026-08-22',
    dismissible: false,
    // pas de displayUntil : reste actif tant que non retiré manuellement
  },
  {
    id: 'pollution-manganese-vendee-2026',
    title:
      "Pollution au manganèse en Vendée : situation maîtrisée — cliquez pour voir toutes les infos",
    status: 'resolved',
    articleSlug: 'pollution-manganese-vendee-juillet-2026',
    publishedAt: '2026-07-09',
    displayUntil: '2026-07-20T23:59:59Z',
  },
];
