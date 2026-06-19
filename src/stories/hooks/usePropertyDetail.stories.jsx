import { useState } from 'react';
import { usePropertyDetail } from '../../react/hooks/usePropertyDetail';
import { withRemixMocks } from '../../../.storybook/mocks/remix';
import { mockProperty } from '../fixtures/properties';

const btn = 'rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800';
const btnAlt = 'rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50';
const row = 'flex justify-between border-b border-gray-100 py-1 text-sm';

function Harness() {
  const [lastCall, setLastCall] = useState('—');
  const { property, isLoading, isError, refresh, fetchProperty } = usePropertyDetail({
    detailPath: '/properties',
    initialProperty: mockProperty
  });

  return (
    <div className="w-full max-w-lg space-y-4 rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btn}
          onClick={() => {
            setLastCall(`fetchProperty('${mockProperty.id}')`);
            fetchProperty(mockProperty.id);
          }}
        >
          fetchProperty(&apos;{mockProperty.id}&apos;)
        </button>
        <button
          type="button"
          className={btnAlt}
          onClick={() => {
            setLastCall('refresh()');
            refresh();
          }}
        >
          refresh()
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
          <dt className="text-gray-500">isError</dt>
          <dd className="font-medium">{String(Boolean(isError))}</dd>
        </div>
        <div className={row}>
          <dt className="text-gray-500">property.id</dt>
          <dd className="font-medium">{property?.id ?? '—'}</dd>
        </div>
        <div className={row}>
          <dt className="text-gray-500">address</dt>
          <dd className="font-medium">{property?.address?.street ?? '—'}</dd>
        </div>
        <div className={row}>
          <dt className="text-gray-500">price</dt>
          <dd className="font-medium">{property?.priceFormatted ?? '—'}</dd>
        </div>
      </dl>

      <p className="text-xs text-gray-400">
        The buttons call the live hook. In your app the route loader returns the property; Storybook&apos;s
        in-memory router doesn&apos;t round-trip fetcher requests, so the values stay at the initial fixture.
      </p>
    </div>
  );
}

export default {
  title: 'Hooks/usePropertyDetail',
  parameters: { layout: 'padded' },
  decorators: [withRemixMocks({ property: mockProperty })]
};

export const Demo = {
  render: () => <Harness />
};
