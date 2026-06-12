import { usePropertyMap } from '../hooks/usePropertyMap';
import { useState, useCallback } from 'react';
import { formatPrice, formatArea } from '../../shared/utils';
import { GoogleMapsProvider } from '../hooks/GoogleMapsContext';

/** Map canvas, loading overlay, and selected-listing preview; must render inside GoogleMapsProvider. */
function PropertyMapContent({
  properties,
  onMarkerClick,
  onBoundsChanged,
  center,
  zoom,
  showCluster,
  className
}) {
  const [selectedProperty, setSelectedProperty] = useState(null);

  const handleMarkerClick = useCallback((property) => {
    setSelectedProperty(property);
    onMarkerClick?.(property);
  }, [onMarkerClick]);

  const { mapRef, isLoading, error } = usePropertyMap({
    properties,
    mapOptions: {
      center,
      zoom,
      clusterMarkers: showCluster,
      onMarkerClick: handleMarkerClick,
      onBoundsChanged
    }
  });

  const handleClosePreview = useCallback(() => {
    setSelectedProperty(null);
  }, []);

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center bg-gray-100 text-gray-500">
        <div className="text-center">
          <div>Failed to load map</div>
          <div className="mt-2 text-sm">{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapRef}
        className="h-[400px] w-full rounded-lg bg-gray-100"
        data-testid="map-container"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      )}

      {selectedProperty && (
        <PropertyPreview
          property={selectedProperty}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
}

/**
 * Render an interactive Google Map of property listings.
 *
 * Wraps its own GoogleMapsProvider, so no outer provider is required.
 * Clicking a marker opens an inline preview card and calls `onMarkerClick`.
 *
 * @param {Object} props
 * @param {string} props.apiKey - Google Maps JavaScript API key.
 * @param {Array<Property>} [props.properties=[]] - Listings to plot; each needs `geo.lat`/`geo.lng`.
 * @param {(property: Property) => void} [props.onMarkerClick] - Called with the listing when its marker is clicked.
 * @param {Function} [props.onBoundsChanged] - Reserved; accepted but not yet wired to map events.
 * @param {PropertyGeo} [props.center] - Initial map center; defaults to San Francisco.
 * @param {number} [props.zoom=12] - Initial zoom level.
 * @param {boolean} [props.showCluster=false] - Reserved; dense areas already collapse to dot markers automatically.
 * @param {string} [props.className] - Additional CSS classes appended to the map wrapper.
 */
export function PropertyMap({
  apiKey,
  properties = [],
  onMarkerClick,
  onBoundsChanged,
  center,
  zoom = 12,
  showCluster = false,
  className = ''
}) {
  return (
    <GoogleMapsProvider apiKey={apiKey}>
      <PropertyMapContent
        properties={properties}
        onMarkerClick={onMarkerClick}
        onBoundsChanged={onBoundsChanged}
        center={center}
        zoom={zoom}
        showCluster={showCluster}
        className={className}
      />
    </GoogleMapsProvider>
  );
}

function PropertyPreview({ property, onClose }) {
  return (
    <div className="absolute bottom-4 left-4 w-72 rounded-lg bg-white p-4 shadow-lg">
      <button
        onClick={onClose}
        className="absolute right-2 top-2 p-1 text-gray-500 hover:text-gray-700"
        aria-label="Close preview"
      >
        <XIcon className="h-4 w-4" />
      </button>

      <div className="aspect-video overflow-hidden rounded-lg">
        <img
          src={property.photos[0]?.url || '/placeholder-property.jpg'}
          alt={property.address.street}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-2">
        <div className="font-semibold text-gray-900">
          {formatPrice(property.price)}
        </div>
        <div className="mt-1 text-sm text-gray-600">
          {property.address.street}
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
          <span>{property.features.beds} beds</span>
          <span>{property.features.baths} baths</span>
          <span>{formatArea(property.features.sqft)}</span>
        </div>
      </div>
    </div>
  );
}

function XIcon({ className = '' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
