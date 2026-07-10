export interface SiteAlert {
  id: string;
  title: string;
  status: 'active' | 'resolved';
  articleSlug: string;
  publishedAt: string; // ISO date
  displayUntil?: string; // ISO date (optional)
}

export const SITE_ALERTS: SiteAlert[] = [
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
