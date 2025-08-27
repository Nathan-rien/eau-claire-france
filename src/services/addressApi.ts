
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
  
  try {
    // Utiliser l'API Adresse du gouvernement français (gratuite et complète)
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodedQuery}&limit=5&autocomplete=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data: AddressApiResponse = await response.json();
    
    return data.features.map(feature => {
      const props = feature.properties;
      const cityName = props.city || props.name;
      
      return {
        label: props.label,
        context: props.context,
        id: props.id,
        name: props.name,
        postcode: props.postcode,
        citycode: props.citycode,
        city: cityName,
        score: props.score
      };
    });
  } catch (error) {
    console.error('Erreur API Adresse:', error);
    
    // Fallback vers les données locales en cas d'erreur API
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
  }
};
