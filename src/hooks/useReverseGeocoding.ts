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
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}&type=municipality`,
      {
        headers: { 'Accept': 'application/json' },
      }
    );

    if (!response.ok) return null;

    const data: ReverseGeocodeApiResponse = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        city: feature.properties.city || feature.properties.label.split(',')[0] || '',
        postcode: feature.properties.postcode || '',
        context: feature.properties.context || '',
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