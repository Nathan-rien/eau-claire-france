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
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(cityName)}&type=municipality&limit=1`,
      {
        headers: { 'Accept': 'application/json' },
      }
    );

    if (!response.ok) return null;

    const data: GeocodeApiResponse = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        citycode: feature.properties.citycode,
        label: feature.properties.label,
        coordinates: feature.geometry.coordinates,
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