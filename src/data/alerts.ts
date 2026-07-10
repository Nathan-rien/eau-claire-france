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
    id: 'alerte-manganese-vendee-2026-07',
    slug: 'pollution-manganese-vendee-juillet-2026',
    title:
      "Vendée — Pollution au manganèse détectée à l'usine du Moulin Papon (8 juillet 2026), alerte levée le 9 juillet 2026 par l'ARS et Vendée Eau",
    status: 'resolved',
    active: true,
    publishedAt: '2026-07-08T08:00:00Z',
    displayUntil: '2026-07-20T23:59:59Z',
  },
];
