import { useFetcher } from '@remix-run/react';
import { useCallback, useState } from 'react';
import { DEFAULT_PARAMS } from '../../shared/constants';

/**
 * Fetch property listings near a coordinate through a Remix route.
 *
 * `searchNearby` submits `{ lat, lng, radius }` via GET to `nearbyPath`; the
 * consuming route's loader must return `{ properties, error? }`. `updateRadius`
 * re-runs the search with a new radius using the lat/lng already present in
 * the current URL, and is a no-op when they are absent.
 *
 * @param {Object} options
 * @param {string} options.nearbyPath - Remix route the nearby search submits to via GET.
 * @param {Array<Property>} [options.initialListings=[]] - Listings shown until the first search resolves.
 * @param {number} [options.radius=5] - Search radius in miles.
 * @returns {{
 *   nearbyListings: Array<Property>,
 *   isLoading: boolean,
 *   isError: boolean,
 *   searchNearby: (coordinates: PropertyGeo) => void,
 *   updateRadius: (radius: number) => void
 * }} `nearbyListings` is the latest route response (or `initialListings`).
 */
export function useNearbyListings({
  nearbyPath,
  initialListings = [],
  radius = DEFAULT_PARAMS.RADIUS
}) {
  const fetcher = useFetcher();

  // Remember the last searched coordinates so `updateRadius` can refetch. A GET
  // `fetcher.submit` doesn't update window.location, so the previous approach of
  // reading lat/lng back from the URL always found nothing and no-opped.
  const [coords, setCoords] = useState(null);

  const isLoading = fetcher.state !== 'idle';
  const isError = Boolean(fetcher.data?.error);

  const searchNearby = useCallback(
    ({ lat, lng }) => {
      if (!lat || !lng) return;

      setCoords({ lat, lng });
      fetcher.submit({ lat, lng, radius }, { method: 'get', action: nearbyPath });
    },
    [fetcher, nearbyPath, radius]
  );

  const updateRadius = useCallback(
    (newRadius) => {
      if (!coords) return;

      fetcher.submit(
        { lat: coords.lat, lng: coords.lng, radius: newRadius },
        { method: 'get', action: nearbyPath }
      );
    },
    [fetcher, nearbyPath, coords]
  );

  const nearbyListings = fetcher.data?.properties || initialListings;

  return {
    nearbyListings,
    isLoading,
    isError,
    searchNearby,
    updateRadius
  };
}
