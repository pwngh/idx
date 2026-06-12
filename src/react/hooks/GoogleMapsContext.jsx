import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const GoogleMapsContext = createContext(null);

/**
 * Provide a shared Google Maps JS API loader to all descendant map components.
 *
 * The loader is created once on first mount and reused for the provider's
 * lifetime, so `apiKey` is read once — changing it later has no effect.
 * Load failures are exposed through the context's `error` field, not thrown.
 *
 * @param {Object} props
 * @param {string} props.apiKey - Google Maps JavaScript API key.
 * @param {import('react').ReactNode} props.children - Subtree that may call useGoogleMapsLoader.
 */
export function GoogleMapsProvider({ children, apiKey }) {
  const loaderRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loaderRef.current) return;

    loaderRef.current = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry', 'marker']
    });

    loaderRef.current.load()
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err);
        setError(err);
      });
  }, [apiKey]);

  const value = {
    loader: loaderRef.current,
    isLoaded,
    error
  };

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

/**
 * Read the Google Maps loader state from the nearest GoogleMapsProvider.
 *
 * @returns {{
 *   loader: import('@googlemaps/js-api-loader').Loader|null,
 *   isLoaded: boolean,
 *   error: Error|null
 * }} `isLoaded` flips true once the Maps API is ready; `error` holds the load failure, if any.
 * @throws {Error} When called outside a GoogleMapsProvider.
 */
export function useGoogleMapsLoader() {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMapsLoader must be used within a GoogleMapsProvider');
  }
  return context;
}
