import { useMemo, useState } from 'react';
import { usePropertyMap } from '../../react/hooks/usePropertyMap';
import { GoogleMapsProvider } from '../../react/hooks/GoogleMapsContext';
import { mockProperties } from '../fixtures/properties';

const btn = 'rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50';
const row = 'flex justify-between border-b border-gray-100 py-1 text-sm';

function Harness() {
  const [lastCall, setLastCall] = useState('—');
  // Memoize so the hook's marker effects don't see a new options object each render.
  const mapOptions = useMemo(() => ({ zoom: 11, center: { lat: 29.7604, lng: -95.3698 } }), []);
  const { mapRef, isLoading, error, setZoom, panTo } = usePropertyMap({
    properties: mockProperties,
    mapOptions
  });

  return (
    <div className="w-full max-w-lg space-y-4 rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btn}
          onClick={() => {
            setLastCall('setZoom(13)');
            setZoom(13);
          }}
        >
          setZoom(13)
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => {
            setLastCall('panTo({ lat: 29.76, lng: -95.37 })');
            panTo({ lat: 29.76, lng: -95.37 });
          }}
        >
          panTo(&hellip;)
        </button>
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
          <dt className="text-gray-500">error</dt>
          <dd className="font-medium">{error ? error.message : 'null'}</dd>
        </div>
        <div className={row}>
          <dt className="text-gray-500">properties</dt>
          <dd className="font-medium">{mockProperties.length}</dd>
        </div>
      </dl>

      <div ref={mapRef} className="h-64 w-full rounded bg-gray-100" data-testid="map-container" />

      <p className="text-xs text-gray-400">
        Set `GOOGLE_MAPS_API_KEY` to render an actual map; without a key the loader stays pending and
        `setZoom`/`panTo` are no-ops until the map instance exists.
      </p>
    </div>
  );
}

export default {
  title: 'Hooks/usePropertyMap',
  parameters: { layout: 'padded' }
};

export const Demo = {
  render: () => (
    <GoogleMapsProvider apiKey={(typeof process !== 'undefined' && process.env.GOOGLE_MAPS_API_KEY) || ''}>
      <Harness />
    </GoogleMapsProvider>
  )
};
