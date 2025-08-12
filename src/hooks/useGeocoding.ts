import { useQuery } from '@tanstack/react-query';

interface GeocodeResult {
  citycode: string;
  label: string;
  coordinates: [number, number];
}

interface GeocodeApiFeature {
  properties: {
    citycode: string;
    label: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface GeocodeApiResponse {
  features: GeocodeApiFeature[];
}

const geocodeCity = async (cityName: string): Promise<GeocodeResult | null> => {
  if (!cityName || cityName.length < 2) return null;
  
  try {
    // Utiliser les données locales à la place de l'API externe
    const { searchCities } = await import('@/data/frenchCities');
    const cities = searchCities(cityName);
    
    if (cities.length > 0) {
      const city = cities[0];
      return {
        citycode: city.citycode,
        label: `${city.name}, ${city.context}`,
        coordinates: city.coordinates,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const useGeocoding = (cityName: string, enabled = true) => {
  return useQuery({
    queryKey: ['geocoding', cityName],
    queryFn: () => geocodeCity(cityName),
    enabled: enabled && !!cityName && cityName.length >= 2,
    staleTime: 60 * 60 * 1000, // 1 hour - city codes don't change
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 1,
  });
};