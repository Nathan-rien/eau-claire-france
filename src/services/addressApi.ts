
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
  if (query.length < 3) return [];
  
  try {
    // Retirer le paramètre type=municipality pour permettre la recherche d'adresses complètes
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Erreur API adresse:', response.status, errorText);
      return [];
    }
    
    const data: AddressApiResponse = await response.json();
    
    return data.features.map(feature => ({
      ...feature.properties,
      label: `${feature.properties.name} (${feature.properties.postcode})`,
      context: feature.properties.context || '',
    }));
  } catch (error) {
    console.error('Erreur API adresse:', error);
    return [];
  }
};
