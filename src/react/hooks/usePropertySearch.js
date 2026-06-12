import { useFetcher, useNavigation } from '@remix-run/react';
import { useCallback, useMemo } from 'react';
import { debounce } from '../../shared/utils';
import { DEFAULT_PARAMS } from '../../shared/constants';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Search property listings through a Remix route, debouncing rapid input.
 *
 * `search` waits 300ms after the last call before submitting, so
 * keystroke-level filter changes collapse into a single GET request to
 * `searchPath`. The consuming route's loader receives the filters as query
 * params and must return `{ properties, error? }` for results to flow back.
 *
 * @param {Object} options
 * @param {string} options.searchPath - Remix route the search submits to via GET.
 * @param {Array<Property>} [options.initialProperties=[]] - Listings shown until the first search resolves.
 * @returns {{
 *   properties: Array<Property>,
 *   isSearching: boolean,
 *   isError: boolean,
 *   search: (params: SearchParameters) => void,
 *   loadMore: () => void
 * }} `properties` is the latest route response (or `initialProperties`);
 *   `loadMore` re-submits with `offset` advanced by the default page size.
 */
export function usePropertySearch({ searchPath, initialProperties = [] }) {
  const fetcher = useFetcher();
  const navigation = useNavigation();

  const isSearching =
    navigation.state === 'loading' ||
    fetcher.state === 'submitting';

  const isError = fetcher.data?.error;

  const search = useMemo(() =>
    debounce((params) => {
      fetcher.submit(
        { ...params },
        {
          method: 'get',
          action: searchPath
        }
      );
    }, SEARCH_DEBOUNCE_MS),
    [fetcher, searchPath]
  );

  const loadMore = useCallback(() => {
    const currentParams = new URLSearchParams(window.location.search);
    const currentOffset = parseInt(currentParams.get('offset') || '0', 10);

    fetcher.submit(
      {
        offset: currentOffset + DEFAULT_PARAMS.LIMIT
      },
      {
        method: 'get',
        action: searchPath
      }
    );
  }, [fetcher, searchPath]);

  const properties = fetcher.data?.properties || initialProperties;

  return {
    properties,
    isSearching,
    isError,
    search,
    loadMore
  };
}
