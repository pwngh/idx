import { useState } from 'react';
import { useNearbyListings } from '../../react/hooks/useNearbyListings';
import { withRemixMocks } from '../../../.storybook/mocks/remix';
import { mockProperties } from '../fixtures/properties';

const btn = 'rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800';
const row = 'flex justify-between border-b border-gray-100 py-1 text-sm';

function Harness() {
  const [lastCall, setLastCall] = useState('—');
  const [radius, setRadius] = useState(5);
  const { nearbyListings, isLoading, isError, searchNearby, updateRadius } = useNearbyListings({
    nearbyPath: '/nearby',
    initialListings: mockProperties,
    radius
  });

  return (
    <div className="w-full max-w-lg space-y-4 rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={btn}
          onClick={() => {
            setLastCall('searchNearby({ lat: 29.7604, lng: -95.3698 })');
            searchNearby({ lat: 29.7604, lng: -95.3698 });
          }}
        >
          searchNearby(Houston)
        </button>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          radius: {radius}mi
          <input
            type="range"
            min="1"
            max="25"
            value={radius}
            onChange={(event) => {
              const value = Number(event.target.value);
              setRadius(value);
              setLastCall(`updateRadius(${value})`);
              updateRadius(value);
            }}
          />
        </label>
      </div>

      <dl className="text-sm">
        <div className={row}>
          <dt className="text-gray-500">last call</dt>
          <dd className="font-mono text-xs">{lastCall}</dd>
        </div>
        <div className={row}>
          <dt className="text-gray-500">isLoading</dt>
          <dd className="font-medium">{String(isLoading)}</dd>
        </div>
        <div className={row}>
          <dt className="text-gray-500">isError</dt>
          <dd className="font-medium">{String(Boolean(isError))}</dd>
        </div>
        <div className={row}>
          <dt className="text-gray-500">nearbyListings.length</dt>
          <dd className="font-medium">{nearbyListings.length}</dd>
        </div>
      </dl>

      <p className="text-xs text-gray-400">
        Run `searchNearby` first to set the coordinates; the radius slider then calls `updateRadius` to refetch
        at the new radius. Storybook&apos;s in-memory router doesn&apos;t round-trip fetcher requests, so the
        list stays at the initial fixtures.
      </p>
    </div>
  );
}

export default {
  title: 'Hooks/useNearbyListings',
  parameters: { layout: 'padded' },
  decorators: [withRemixMocks({ properties: mockProperties })]
};

export const Demo = {
  render: () => <Harness />
};
