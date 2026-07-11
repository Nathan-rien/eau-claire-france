import { useEffect } from 'react';
import { trackEvent } from '@/utils/ga';

interface Props {
  name: string;
}

/**
 * Fires a GA4 `map_view` event once when a map page mounts.
 */
const TrackMapView = ({ name }: Props) => {
  useEffect(() => {
    trackEvent('map_view', { map: name });
  }, [name]);
  return null;
};

export default TrackMapView;
