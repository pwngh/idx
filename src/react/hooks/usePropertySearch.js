import { useFetcher, useNavigation } from '@remix-run/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
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

  // Keep the latest fetcher in a ref so the debounced `search` (and its pending
  // timer) survives the fetcher identity changing between renders.
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // Track the running offset and last filters here, not in the URL: a GET
  // `fetcher.submit` does not update window.location, so reading the offset back
  // from it always returned 0 and `loadMore` never advanced past the first page.
  const lastParamsRef = useRef({});
  const offsetRef = useRef(0);

  const isSearching = navigation.state === 'loading' || fetcher.state === 'submitting';
  const isError = Boolean(fetcher.data?.error);

  const search = useMemo(
    () =>
      debounce((params = {}) => {
        lastParamsRef.current = params;
        offsetRef.current = 0;
        fetcherRef.current.submit({ ...params }, { method: 'get', action: searchPath });
      }, SEARCH_DEBOUNCE_MS),
    [searchPath]
  );

  // Drop any pending debounced submit when `search` is rebuilt (searchPath
  // changed) or the component unmounts, so a stale timer can't fire late.
  useEffect(() => () => search.cancel(), [search]);

  const loadMore = useCallback(() => {
    offsetRef.current += DEFAULT_PARAMS.LIMIT;
    fetcherRef.current.submit(
      { ...lastParamsRef.current, offset: offsetRef.current },
      { method: 'get', action: searchPath }
    );
  }, [searchPath]);

  const properties = fetcher.data?.properties || initialProperties;

  return {
    properties,
    isSearching,
    isError,
    search,
    loadMore
  };
}
