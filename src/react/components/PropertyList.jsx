import { PropertyCard } from './PropertyCard';
import { useNavigation } from '@remix-run/react';

const GRID = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';

/**
 * Render a responsive grid of property cards with optional header, loading, and empty states.
 *
 * @param {Object} props
 * @param {Array<Property>} [props.properties=[]] - Listings to render, one card each.
 * @param {(property: Property) => void} [props.onPropertyClick] - Forwarded to each card as its click handler.
 * @param {(property: Property) => string} [props.getHref] - When provided, each card links to the returned URL.
 * @param {Object} [props.cardProps] - Extra props spread onto every PropertyCard (e.g. showMlsNumber).
 * @param {import('react').ReactNode} [props.header] - Content rendered at the start of the header row.
 * @param {import('react').ReactNode} [props.headerRight] - Content rendered at the end of the header row (e.g. a sort control).
 * @param {boolean} [props.showResultsCount=true] - Show a "N results" count in the header row.
 * @param {boolean} [props.showLoading=false] - Show skeleton cards while a Remix navigation is loading.
 * @param {boolean} [props.isLoading] - Force the loading state, overriding the Remix navigation check.
 * @param {string} [props.emptyMessage='No properties found'] - Text shown when there are no listings.
 * @param {string} [props.className] - Additional CSS classes appended to the outer container.
 */
export function PropertyList({
  properties = [],
  onPropertyClick,
  getHref,
  cardProps = {},
  header,
  headerRight,
  showResultsCount = true,
  showLoading = false,
  isLoading,
  emptyMessage = 'No properties found',
  className = ''
}) {
  const navigation = useNavigation();
  const loading = isLoading !== undefined ? isLoading : showLoading && navigation.state === 'loading';
  const count = properties.length;

  const hasHeader = Boolean(header) || Boolean(headerRight) || showResultsCount;
  const headerRow = hasHeader ? (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        {header}
        {showResultsCount ? (
          <span className="font-medium text-gray-900">
            {count.toLocaleString()} {count === 1 ? 'result' : 'results'}
          </span>
        ) : null}
      </div>
      {headerRight ? <div className="flex items-center gap-2">{headerRight}</div> : null}
    </div>
  ) : null;

  if (loading) {
    return (
      <div className={className}>
        {headerRow}
        <div className={GRID}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="aspect-[4/3] animate-pulse bg-gray-200" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!count) {
    return (
      <div className={className}>
        {headerRow}
        <div className="py-12 text-center text-gray-500">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={className}>
      {headerRow}
      <div className={GRID}>
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onClick={onPropertyClick}
            href={getHref ? getHref(property) : undefined}
            {...cardProps}
          />
        ))}
      </div>
    </div>
  );
}
