export interface NewsAlert {
  id: string;
  slug: string;
  title: string;
  status: 'active' | 'resolved';
  active: boolean;
  publishedAt: string; // ISO date
  displayUntil: string; // ISO date
}

export const NEWS_ALERTS: NewsAlert[] = [
  {
    id: 'alert-2026-pfas-nord',
    slug: 'alerte-pfas-nord-2026',
    title: "Alerte PFAS détectée dans plusieurs communes du Nord — analyses en cours",
    status: 'active',
    active: true,
    publishedAt: '2026-07-08T08:00:00Z',
    displayUntil: '2026-07-31T23:59:59Z',
  },
];
