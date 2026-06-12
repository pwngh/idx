/**
 * Render a single property listing as a clickable summary card.
 *
 * Shows the primary photo (or a placeholder), price, address, and key
 * features. The whole card is the click target.
 *
 * @param {Object} props
 * @param {Property} props.property - Listing to display; reads address, features, price, and photos.
 * @param {(property: Property) => void} [props.onClick] - Called with the full listing when the card is clicked.
 * @param {string} [props.className] - Additional CSS classes appended to the card container.
 */
export function PropertyCard({ property, onClick, className = '' }) {
  const { address, features, price, photos } = property;
  const mainPhoto = photos?.[0]?.url || '/placeholder-property.jpg';

  return (
    <div
      onClick={() => onClick?.(property)}
      className={`group cursor-pointer rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
        <img
          src={mainPhoto}
          alt={address.street}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute bottom-2 left-2 rounded bg-white px-2 py-1 text-sm font-semibold">
          {price}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-900">
          {address.street}
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {address.city}, {address.state} {address.zip}
        </p>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span>{features.beds} beds</span>
          <span>{features.baths} baths</span>
          <span>{features.sqft.toLocaleString()} sqft</span>
        </div>
      </div>
    </div>
  );
}
