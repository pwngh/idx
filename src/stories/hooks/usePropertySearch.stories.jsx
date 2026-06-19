import { useState } from 'react';
import { usePropertySearch } from '../../react/hooks/usePropertySearch';
import { withRemixMocks } from '../../../.storybook/mocks/remix';
import { mockProperties } from '../fixtures/properties';

const btn = 'rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800';
const btnAlt = 'rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50';
const row = 'flex justify-between border-b border-gray-100 py-1 text-sm';

function Harness() {
  const [lastCall, setLastCall] = useState('—');
  const { properties, isSearching, isError, search, loadMore } = usePropertySearch({
    searchPath: '/search',
    initialProperties: mockProperties.slice(0, 3)
  });

  return (
    <div className="w-full max-w-lg space-y-4 rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btn}
          onClick={() => {
            setLastCall('search({ minPrice: 400000, beds: 3 })');
            search({ minPrice: 400000, beds: 3 });
          }}
        >
          search(&#123; minPrice: 400000, beds: 3 &#125;)
        </button>
        <button
          type="button"
          className={btnAlt}
          onClick={() => {
            setLastCall('loadMore()');
            loadMore();
          }}
        >
          loadMore()
        </button>
      </div>

      <dl className="text-sm">
        <div className={row}>
          <dt className="text-gray-500">last call</dt>
          <dd className="font-mono text-xs">{lastCall}</dd>
        </div>
        <div className={row}>
          <dt className="text-gray-500">isSearching</dt>
          <dd className="font-medium">{String(isSearching)}</dd>
        </div>
        <div className={row}>
          <dt className="text-gray-500">isError</dt>
          <dd className="font-medium">{String(Boolean(isError))}</dd>
        </div>
        <div className={row}>
          <dt className="text-gray-500">properties.length</dt>
          <dd className="font-medium">{properties.length}</dd>
        </div>
      </dl>

      <ul className="space-y-1 text-sm text-gray-700">
        {properties.map((property) => (
          <li key={property.id} className="flex justify-between">
            <span className="truncate">{property.address.street}</span>
            <span className="ml-2 shrink-0 font-medium">{property.priceFormatted}</span>
          </li>
        ))}
      </ul>

      <p className="text-xs text-gray-400">
        The buttons call the live hook. In your app the route loader returns the results; Storybook&apos;s
        in-memory router doesn&apos;t round-trip fetcher requests, so the list stays at the initial fixtures.
      </p>
    </div>
  );
}

export default {
  title: 'Hooks/usePropertySearch',
  parameters: { layout: 'padded' },
  decorators: [withRemixMocks({ properties: mockProperties })]
};

export const Demo = {
  render: () => <Harness />
};
