import { useQuery } from '@tanstack/react-query';

interface ReverseGeocodeResult {
  city: string;
  postcode: string;
  context: string;
}

interface ReverseGeocodeApiFeature {
  properties: {
    city?: string;
    postcode?: string;
    context?: string;
    label: string;
  };
}

interface ReverseGeocodeApiResponse {
  features: ReverseGeocodeApiFeature[];
}

const reverseGeocode = async (latitude: number, longitude: number): Promise<ReverseGeocodeResult | null> => {
  try {
    // Utiliser les données locales à la place de l'API externe
    const { findNearestCity } = await import('@/data/frenchCities');
    const nearestCity = findNearestCity(latitude, longitude);
    
    if (nearestCity) {
      return {
        city: nearestCity.name,
        postcode: nearestCity.postcode,
        context: nearestCity.context,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

export const useReverseGeocoding = (coordinates: { latitude: number; longitude: number } | null) => {
  return useQuery({
    queryKey: ['reverseGeocode', coordinates?.latitude, coordinates?.longitude],
    queryFn: () => coordinates ? reverseGeocode(coordinates.latitude, coordinates.longitude) : null,
    enabled: !!coordinates,
    staleTime: 60 * 60 * 1000, // 1 hour - locations don't change frequently
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 1,
  });
};