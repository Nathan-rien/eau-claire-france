
export interface AddressSuggestion {
  label: string;
  context: string;
  id: string;
  name: string;
  postcode: string;
  citycode: string;
  city: string;
  score: number;
}

export interface AddressApiResponse {
  features: {
    properties: AddressSuggestion;
    geometry: {
      coordinates: [number, number];
    };
  }[];
}

export const searchAddresses = async (query: string): Promise<AddressSuggestion[]> => {
  if (query.length < 2) return [];
  
  // Utiliser les données locales à la place de l'API externe
  const { searchCities } = await import('@/data/frenchCities');
  const cities = searchCities(query);
  
  return cities.map(city => ({
    label: `${city.name} (${city.postcode})`,
    context: city.context,
    id: city.citycode,
    name: city.name,
    postcode: city.postcode,
    citycode: city.citycode,
    city: city.name,
    score: (city as any).score || 1
  }));
};
