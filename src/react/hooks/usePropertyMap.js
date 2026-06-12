import { useState, useEffect, useCallback, useRef } from 'react';
import { useGoogleMapsLoader } from './GoogleMapsContext';

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 }; // San Francisco
const DEFAULT_ZOOM = 13;
const MAX_FIT_BOUNDS_ZOOM = 16;
const EARTH_RADIUS_KM = 6371;
const DENSE_NEARBY_THRESHOLD = 4;
const REPRESENTATIVE_MARKER_COUNT = 2;

const MAP_STYLES = [
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1f2937' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#dbeafe' }]
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#f3f4f6' }]
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  }
];

/** Latitude offset that separates stacked dot and pill markers, scaled to zoom. */
function getMarkerOffset(isDot, zoom) {
  const baseOffset = Math.pow(2, (20 - zoom)) / 20000;
  return isDot ? -baseOffset : baseOffset * 2;
}

function createDotIcon(isSelected = false, isHovered = false) {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: isSelected ? '#000000' : (isHovered ? '#333333' : '#000000'),
    fillOpacity: 1,
    strokeColor: '#FFFFFF',
    strokeWeight: 2,
    scale: isSelected ? 10 : (isHovered ? 9 : 8)
  };
}

function createPriceIcon(isSelected = false, isHovered = false) {
  const pillPath = 'M -30,-10 L 30,-10 A 10,10 0 0,1 30,10 L -30,10 A 10,10 0 0,1 -30,-10 z';

  return {
    path: pillPath,
    fillColor: isSelected ? '#000000' : (isHovered ? '#000000' : '#FFFFFF'),
    fillOpacity: 1,
    strokeColor: '#000000',
    strokeWeight: 1.5,
    scale: isSelected ? 1.1 : (isHovered ? 1.05 : 1),
    labelOrigin: new google.maps.Point(0, 0)
  };
}

/** Format a price as a compact marker label, e.g. "750K" or "1.2M". */
function formatPriceLabel(price) {
  const priceInK = Math.round(price / 1000);
  return priceInK >= 1000 ? `${(priceInK / 1000).toFixed(1)}M` : `${priceInK}K`;
}

/** Build a marker label spec, or null when there is no text to show. */
function createMarkerLabel(text) {
  return text
    ? { text, color: '#000000', fontSize: '13px', fontWeight: '500' }
    : null;
}

/** Detach a marker from the map and release its listeners and info window. */
function removeMarker(marker) {
  if (!marker) return;
  if (marker.infoWindow) {
    marker.infoWindow.close();
  }
  google.maps.event.clearInstanceListeners(marker);
  marker.setMap(null);
}

/**
 * Render and manage a Google Map with density-aware property markers.
 *
 * Must be used inside a GoogleMapsProvider. Markers are rebuilt whenever
 * `properties` changes: sparse areas get labeled price pills, dense areas
 * collapse to dots with the most expensive listings kept as pills, and the
 * viewport is fit to the full set of listings.
 *
 * @param {Object} options
 * @param {Array<Property>} [options.properties=[]] - Listings to plot; each needs `geo.lat`/`geo.lng`.
 * @param {Object} [options.mapOptions] - Map configuration.
 * @param {PropertyGeo} [options.mapOptions.center] - Initial center; defaults to San Francisco.
 * @param {number} [options.mapOptions.zoom=13] - Initial zoom level.
 * @param {(property: Property) => void} [options.mapOptions.onMarkerClick] - Called with the listing when its marker is clicked.
 * @returns {{
 *   mapRef: import('react').RefObject<HTMLDivElement>,
 *   isLoading: boolean,
 *   error: Error|null,
 *   panTo: (coordinates: PropertyGeo) => void,
 *   setZoom: (level: number) => void,
 *   getBounds: () => google.maps.LatLngBounds|null
 * }} `mapRef` must be attached to the container element; `error` captures
 *   map-initialization and marker failures.
 */
export function usePropertyMap({
  properties = [],
  mapOptions = {}
}) {
  const { isLoaded } = useGoogleMapsLoader();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  // track mounted state
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  /** Classify a marker by local listing density: plain pill, dot, or representative pill. */
  const getMarkerType = useCallback((markerPosition) => {
    if (!mapInstance.current) return { isDot: false, isRepresentative: false };

    const zoom = mapInstance.current.getZoom();
    const radius = Math.pow(2, (20 - zoom)) / 2000;

    // Haversine distance to every listing, keeping those within the zoom-scaled radius (km)
    const nearby = properties.filter(p => {
      const lat1 = markerPosition.lat * Math.PI / 180;
      const lat2 = p.geo.lat * Math.PI / 180;
      const deltaLat = (p.geo.lat - markerPosition.lat) * Math.PI / 180;
      const deltaLng = (p.geo.lng - markerPosition.lng) * Math.PI / 180;

      const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = EARTH_RADIUS_KM * c;

      return distance <= radius;
    });

    // sparse areas always get a labeled price pill
    if (nearby.length <= DENSE_NEARBY_THRESHOLD) {
      return { isDot: false, isRepresentative: false };
    }

    // in dense areas, only the most expensive nearby listings keep a price pill
    const currentProperty = properties.find(p =>
      p.geo.lat === markerPosition.lat && p.geo.lng === markerPosition.lng
    );

    const sortedNearby = [...nearby].sort((a, b) => b.price - a.price);
    const isRepresentative = sortedNearby.indexOf(currentProperty) < REPRESENTATIVE_MARKER_COUNT;

    return {
      isDot: !isRepresentative,
      isRepresentative
    };
  }, [properties]);

  /** Wire hover and click-to-select styling onto a marker. */
  const addMarkerHoverEffects = useCallback((marker, isDot) => {
    let isHovered = false;
    let isSelected = false;

    marker.addListener('mouseover', () => {
      isHovered = true;
      marker.setIcon(isDot ?
        createDotIcon(isSelected, true) :
        createPriceIcon(isSelected, true)
      );

      if (marker.getLabel()) {
        marker.setLabel({
          ...marker.getLabel(),
          color: isHovered || isSelected ? '#FFFFFF' : '#000000',
          fontSize: '14px'
        });
      }
    });

    marker.addListener('mouseout', () => {
      isHovered = false;
      marker.setIcon(isDot ?
        createDotIcon(isSelected, false) :
        createPriceIcon(isSelected, false)
      );

      if (marker.getLabel()) {
        marker.setLabel({
          ...marker.getLabel(),
          color: isSelected ? '#FFFFFF' : '#000000',
          fontSize: '13px'
        });
      }
    });

    marker.addListener('click', () => {
      // deselect every other marker before toggling this one
      markersRef.current.forEach(m => {
        if (m !== marker) {
          const mIsDot = m.getIcon().path === google.maps.SymbolPath.CIRCLE;
          m.setIcon(mIsDot ? createDotIcon(false, false) : createPriceIcon(false, false));
          if (m.getLabel()) {
            m.setLabel({
              ...m.getLabel(),
              color: '#000000',
              fontSize: '13px'
            });
          }
        }
      });

      isSelected = !isSelected;
      marker.setIcon(isDot ?
        createDotIcon(isSelected, isHovered) :
        createPriceIcon(isSelected, isHovered)
      );

      if (marker.getLabel()) {
        marker.setLabel({
          ...marker.getLabel(),
          color: isSelected ? '#FFFFFF' : '#000000',
          fontSize: isSelected ? '14px' : '13px',
          fontWeight: isSelected ? '600' : '500'
        });
      }
    });
  }, []);

  // initialize map
  useEffect(() => {
    let currentMapElement = null;

    if (!isLoaded || !mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      try {
        currentMapElement = mapRef.current;

        const map = new google.maps.Map(currentMapElement, {
          zoom: mapOptions.zoom || DEFAULT_ZOOM,
          center: mapOptions.center || DEFAULT_CENTER,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
          },
          gestureHandling: 'greedy',
          styles: MAP_STYLES
        });

        // re-evaluate marker density whenever the zoom changes
        map.addListener('zoom_changed', () => {
          if (!isMounted.current) return;

          markersRef.current.forEach(marker => {
            const position = marker.getPosition().toJSON();
            const { isDot, isRepresentative } = getMarkerType(position);
            const prop = properties.find(p =>
              p.geo.lat === position.lat && p.geo.lng === position.lng
            );

            if (prop) {
              const label = (!isDot || isRepresentative) ? formatPriceLabel(prop.price) : '';

              marker.setIcon(isDot ?
                createDotIcon(false, false) :
                createPriceIcon(false, false)
              );
              marker.setLabel(createMarkerLabel(label));
            }
          });
        });

        if (isMounted.current && currentMapElement === mapRef.current) {
          mapInstance.current = map;
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing map:', err);
        if (isMounted.current) {
          setError(err);
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        google.maps.event.clearInstanceListeners(mapInstance.current);
      }
    };
  }, [isLoaded, mapOptions.zoom, mapOptions.center, properties, getMarkerType]);

  // update markers when properties change
  useEffect(() => {
    if (!mapInstance.current || !properties.length || !isLoaded || !isMounted.current) return;

    try {
      // clear existing markers
      markersRef.current.forEach(removeMarker);

      if (!isMounted.current) return;

      markersRef.current = [];

      // create new markers, nudging dots apart from pills at the same coordinates
      const newMarkers = properties.map(property => {
        const basePosition = { lat: property.geo.lat, lng: property.geo.lng };
        const { isDot, isRepresentative } = getMarkerType(basePosition);

        const zoom = mapInstance.current.getZoom();
        const offset = getMarkerOffset(isDot, zoom);
        const offsetPosition = {
          lat: basePosition.lat + offset,
          lng: basePosition.lng
        };

        const position = isRepresentative ? basePosition : offsetPosition;
        const label = (!isDot || isRepresentative) ? formatPriceLabel(property.price) : '';

        const marker = new google.maps.Marker({
          map: mapInstance.current,
          position,
          title: property.address.street,
          icon: isDot ? createDotIcon(false, false) : createPriceIcon(false, false),
          label: createMarkerLabel(label)
        });

        addMarkerHoverEffects(marker, isDot);

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px;">
              <div style="font-weight: 600; font-size: 16px; color: #000000;">
                $${property.price.toLocaleString()}
              </div>
              <div style="color: #666666; margin-top: 4px;">
                ${property.address.street}
              </div>
            </div>
          `,
          pixelOffset: new google.maps.Size(0, isDot ? 0 : -5)
        });

        if (mapOptions.onMarkerClick) {
          marker.addListener('click', () => {
            if (isMounted.current) {
              markersRef.current.forEach(m => {
                if (m.infoWindow) m.infoWindow.close();
              });

              infoWindow.open(mapInstance.current, marker);
              marker.infoWindow = infoWindow;

              mapOptions.onMarkerClick(property);
            }
          });
        }

        return marker;
      });

      if (!isMounted.current) {
        newMarkers.forEach(removeMarker);
        return;
      }

      markersRef.current = newMarkers;

      // fit bounds to markers
      if (newMarkers.length > 0 && mapInstance.current) {
        const bounds = new google.maps.LatLngBounds();
        properties.forEach(property => {
          bounds.extend({ lat: property.geo.lat, lng: property.geo.lng });
        });
        mapInstance.current.fitBounds(bounds);

        // fitBounds can over-zoom on tight clusters; clamp it once the map settles
        google.maps.event.addListenerOnce(mapInstance.current, 'idle', () => {
          if (mapInstance.current.getZoom() > MAX_FIT_BOUNDS_ZOOM) {
            mapInstance.current.setZoom(MAX_FIT_BOUNDS_ZOOM);
          }
        });
      }
    } catch (err) {
      console.error('Error updating markers:', err);
      if (isMounted.current) {
        setError(err);
      }
    }
  }, [properties, mapOptions.onMarkerClick, isLoaded, addMarkerHoverEffects, mapOptions, getMarkerType]);

  // cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;

      if (markersRef.current) {
        markersRef.current.forEach(removeMarker);
        markersRef.current = [];
      }

      if (mapInstance.current) {
        google.maps.event.clearInstanceListeners(mapInstance.current);
        mapInstance.current = null;
      }
    };
  }, []);

  const panTo = useCallback(({ lat, lng }) => {
    if (mapInstance.current && lat && lng && isMounted.current) {
      mapInstance.current.panTo({ lat, lng });
    }
  }, []);

  const setZoom = useCallback((level) => {
    if (mapInstance.current && isMounted.current) {
      mapInstance.current.setZoom(level);
    }
  }, []);

  const getBounds = useCallback(() => {
    return mapInstance.current && isMounted.current ? mapInstance.current.getBounds() : null;
  }, []);

  return {
    mapRef,
    isLoading,
    error,
    panTo,
    setZoom,
    getBounds
  };
}
