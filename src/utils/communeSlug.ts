import { FRENCH_CITIES, type CityData } from '@/data/frenchCities';

const stripAccents = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const communeToSlug = (city: CityData): string => {
  const namePart = stripAccents(city.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${namePart}-${city.postcode}`;
};

export const findCommuneBySlug = (slug: string): CityData | undefined => {
  return FRENCH_CITIES.find((c) => communeToSlug(c) === slug);
};

export const allCommunes = (): CityData[] =>
  [...FRENCH_CITIES].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

export const communesByRegion = (): Record<string, CityData[]> => {
  const groups: Record<string, CityData[]> = {};
  for (const c of FRENCH_CITIES) {
    (groups[c.context] ??= []).push(c);
  }
  for (const region of Object.keys(groups)) {
    groups[region].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }
  return groups;
};
