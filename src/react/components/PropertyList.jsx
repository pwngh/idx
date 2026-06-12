import { PropertyCard } from './PropertyCard';
import { useNavigation } from '@remix-run/react';

/**
 * Render a responsive grid of property cards with loading and empty states.
 *
 * @param {Object} props
 * @param {Array<Property>} [props.properties=[]] - Listings to render, one card each.
 * @param {(property: Property) => void} [props.onPropertyClick] - Forwarded to each card as its click handler.
 * @param {boolean} [props.showLoading=false] - Show skeleton cards while a Remix navigation is loading.
 * @param {string} [props.className] - Additional CSS classes appended to the grid container.
 * @param {string} [props.emptyMessage='No properties found'] - Text shown when there are no listings.
 */
export function PropertyList({
  properties = [],
  onPropertyClick,
  showLoading = false,
  className = '',
  emptyMessage = 'No properties found'
}) {
  const navigation = useNavigation();
  const isLoading = showLoading && navigation.state === 'loading';

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg bg-gray-100 aspect-[4/3]"
          />
        ))}
      </div>
    );
  }

  if (!properties.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onClick={onPropertyClick}
        />
      ))}
    </div>
  );
}
