import { createRemixStub } from '@remix-run/testing';
import { useMemo, useRef } from 'react';

const mockState = {
  loaderData: null,
  actionData: null,
  navigationState: 'idle'
};

/**
 * Storybook decorator that renders a story inside a Remix data-router stub.
 *
 * Use it for components/hooks that read Remix router state — `useNavigation`,
 * `useSearchParams`, `useFetcher`, or `<Form>`. The stub registers the paths the
 * idx hooks fetch from (`/search`, `/nearby`, `/properties/:id`) so the demo
 * actions actually resolve and return data.
 *
 * Notes:
 * - `createRemixStub` reads each route's `Component` (the older `element` field
 *   is ignored), so the story renders via the root route's Component.
 * - The stub is memoized so it is built once per mount. Rebuilding it on every
 *   render would recreate the data router and wipe `fetcher.data`, making the
 *   demo fetches look like no-ops.
 * - Loaders close over `mockData`, so the global `resetRemixMocks` decorator
 *   can't null the data out from under an in-flight fetch.
 *
 * @param {Object} [mockData={}] - Value returned from every route loader (read by
 *   `useLoaderData` and the hooks' fetchers), e.g. `{ properties }` or `{ property }`.
 */
export const withRemixMocks =
  (mockData = {}) =>
  function WithRemixMocks(Story) {
    // Keep the latest story in a ref so the once-built stub always renders it.
    const storyRef = useRef(Story);
    storyRef.current = Story;

    const RemixStub = useMemo(() => {
      const Root = () => {
        const CurrentStory = storyRef.current;
        return <CurrentStory />;
      };
      return createRemixStub([
        { id: 'root', path: '/', Component: Root, loader: () => mockData },
        { id: 'idx-search', path: '/search', loader: () => mockData },
        { id: 'idx-nearby', path: '/nearby', loader: () => mockData },
        { id: 'idx-detail', path: '/properties/:id', loader: () => mockData }
      ]);
      // mockData is a stable closure value, so the stub is built exactly once.
    }, []);

    return <RemixStub initialEntries={['/']} />;
  };

export const resetRemixMocks = () => {
  mockState.loaderData = null;
  mockState.actionData = null;
  mockState.navigationState = 'idle';
};

export const setNavigationState = (state) => {
  mockState.navigationState = state;
};

export const setActionData = (data) => {
  mockState.actionData = data;
};
