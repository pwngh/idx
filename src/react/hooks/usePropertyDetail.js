import { useFetcher, useNavigation } from '@remix-run/react';
import { useCallback } from 'react';

/**
 * Load and refresh a single property listing through a Remix route.
 *
 * `fetchProperty(id)` loads `${detailPath}/${id}`; the consuming route's
 * loader must return `{ property, error? }`. `refresh` refetches whichever
 * listing is currently held, fetched or initial.
 *
 * @param {Object} options
 * @param {string} options.detailPath - Remix route prefix; the property ID is appended as a path segment.
 * @param {Property|null} [options.initialProperty=null] - Listing shown until the first fetch resolves.
 * @returns {{
 *   property: Property|null,
 *   isLoading: boolean,
 *   isError: boolean,
 *   refresh: () => void,
 *   fetchProperty: (id: string) => void
 * }} `property` is the latest route response (or `initialProperty`).
 */
export function usePropertyDetail({ detailPath, initialProperty = null }) {
  const fetcher = useFetcher();
  const navigation = useNavigation();

  const isLoading =
    navigation.state === 'loading' ||
    fetcher.state === 'submitting';

  const isError = fetcher.data?.error;

  const fetchProperty = useCallback((id) => {
    if (!id) return;

    fetcher.load(`${detailPath}/${id}`);
  }, [fetcher, detailPath]);

  const refresh = useCallback(() => {
    const property = fetcher.data?.property || initialProperty;
    if (property?.id) {
      fetchProperty(property.id);
    }
  }, [fetcher.data?.property, initialProperty, fetchProperty]);

  const property = fetcher.data?.property || initialProperty;

  return {
    property,
    isLoading,
    isError,
    refresh,
    fetchProperty
  };
}
