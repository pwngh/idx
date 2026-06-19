import { usePropertyMap } from '../hooks/usePropertyMap';
import { useState, useCallback, useEffect } from 'react';
import { formatPrice, formatArea, formatAddress, formatNumber, getBathCount } from '../../shared/utils';
import { GoogleMapsProvider } from '../hooks/GoogleMapsContext';
import { CloseIcon, PhotoPlaceholder } from './icons';

/** Map canvas, loading overlay, and selected-listing preview; must render inside GoogleMapsProvider. */
function PropertyMapContent({
  properties,
  onMarkerClick,
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
      onMarkerClick: handleMarkerClick
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
 * @param {PropertyGeo} [props.center] - Initial map center; defaults to San Francisco.
 * @param {number} [props.zoom=12] - Initial zoom level.
 * @param {boolean} [props.showCluster=false] - Reserved; dense areas already collapse to dot markers automatically.
 * @param {string} [props.className] - Additional CSS classes appended to the map wrapper.
 */
export function PropertyMap({
  apiKey,
  properties = [],
  onMarkerClick,
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
        center={center}
        zoom={zoom}
        showCluster={showCluster}
        className={className}
      />
    </GoogleMapsProvider>
  );
}

function PropertyPreview({ property, onClose }) {
  // Close on Escape, matching the keyboard affordance PropertyGallery provides.
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { id, status, price, priceFormatted, photos = [], address = {}, features = {} } = property || {};
  const mainPhoto = photos[0]?.url;
  const beds = features.beds ?? 0;
  const baths = getBathCount(features.baths);
  const sqft = Number(features.sqft) || 0;

  return (
    <div
      role="region"
      aria-label="Property preview"
      className="absolute bottom-4 left-4 z-10 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
    >
      <div className="relative aspect-video bg-gray-100">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={address.street || 'Property photo'}
            className="h-full w-full object-cover"
          />
        ) : (
          <PhotoPlaceholder className="h-full w-full" />
        )}

        {status ? (
          <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {status}
          </span>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3">
        <div className="font-semibold text-gray-900">{priceFormatted || formatPrice(price)}</div>
        <div className="mt-1 text-xs text-gray-500">
          {formatNumber(beds)}bd &bull; {formatNumber(baths)}ba &bull; {formatArea(sqft)}
        </div>
        <div className="mt-1 line-clamp-2 text-sm text-gray-700">
          {formatAddress(address) || 'Address unavailable'}
        </div>
        {id ? <div className="mt-1 text-xs text-gray-400">MLS&reg; {id}</div> : null}
      </div>
    </div>
  );
}
