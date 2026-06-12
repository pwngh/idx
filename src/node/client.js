import { ERROR_MESSAGES, API_ENDPOINTS, API_BASE_URL } from '../shared/constants.js';

/**
 * Build a Bridge API URL with authentication and query params applied.
 *
 * Params with null or undefined values are omitted; everything else
 * (including 0 and empty strings) is serialized as-is.
 *
 * @param {ClientConfig} config - Must include the `apiKey` sent as `access_token`.
 * @param {string} resource - Resource path relative to the HAR dataset, e.g. 'listings' or 'listings/123'.
 * @param {Object} [params] - Query params to append.
 * @returns {URL} Fully qualified request URL.
 */
export function buildApiUrl({ apiKey }, resource, params = {}) {
  const url = new URL(`${API_BASE_URL}/${resource}`);
  url.searchParams.set('access_token', apiKey);

  Object.entries(params).forEach(([key, value]) => {
    if (value != null) url.searchParams.set(key, value);
  });

  return url;
}

/**
 * Create a low-level client for the Bridge HAR API.
 *
 * Failed requests are logged and re-thrown as a generic IDX service error,
 * so callers never see raw fetch/HTTP errors.
 *
 * @param {ClientConfig} [config] - `apiKey` is required; a `headers` option replaces the JSON defaults entirely and any remaining options are passed to fetch.
 * @returns {IDXClient} Resource client exposing properties, offices, agents, and media.
 * @throws {Error} If `config.apiKey` is missing.
 */
export function createClient({ apiKey, ...config } = {}) {
  if (!apiKey) {
    throw new Error('API key is required to initialize the IDX client');
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  async function request(endpoint, params = {}) {
    try {
      const url = buildApiUrl({ apiKey }, endpoint, params);
      const response = await fetch(url.toString(), {
        headers: {
          ...defaultHeaders,
          ...(config.headers || {})
        },
        ...config
      });

      if (!response.ok) {
        throw new Error(`${ERROR_MESSAGES.API_ERROR}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error);
      throw new Error(ERROR_MESSAGES.API_ERROR);
    }
  }

  async function getById(resource, id, params = {}) {
    if (!id) throw new Error(ERROR_MESSAGES.MISSING_ID);
    return request(`${resource}/${id}`, params);
  }

  return {
    properties: {
      list: (params) => request(API_ENDPOINTS.PROPERTIES, params),
      getById: (id, params) => getById(API_ENDPOINTS.PROPERTIES, id, params),
      search: (params) => request(API_ENDPOINTS.PROPERTIES, params),
      nearby: (params) => request(API_ENDPOINTS.PROPERTIES, params)
    },
    offices: {
      list: (params) => request(API_ENDPOINTS.OFFICES, params),
      getById: (id, params) => getById(API_ENDPOINTS.OFFICES, id, params)
    },
    agents: {
      list: (params) => request(API_ENDPOINTS.AGENTS, params),
      getById: (id, params) => getById(API_ENDPOINTS.AGENTS, id, params)
    },
    media: {
      list: (params) => request(API_ENDPOINTS.MEDIA, params),
      getById: (id, params) => getById(API_ENDPOINTS.MEDIA, id, params)
    }
  };
}
