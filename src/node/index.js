import { createClient } from './client.js';
import { createMethods } from './methods.js';

/**
 * Create a ready-to-use IDX instance: high-level methods plus the underlying client.
 *
 * Intended for server-side use (e.g. Remix loaders/actions) so the API key
 * never reaches the browser. The raw resource client is exposed as `client`
 * for requests the high-level methods don't cover.
 *
 * @param {ClientConfig} config - `apiKey` is required; `headers` and any remaining options are forwarded to fetch.
 * @returns {{
 *   getListings: (parameters?: SearchParameters) => Promise<{total: number, listings: Array<Property>}>,
 *   getPropertyDetails: (id: string) => Promise<Property>,
 *   getAgentDetails: (id: string) => Promise<Agent>,
 *   getNearbyListings: (lat: number, lng: number, radius?: number) => Promise<Array<Property>>,
 *   searchProperties: (filters?: SearchParameters) => Promise<Array<Property>>,
 *   getOfficeListings: (officeId: string, parameters?: SearchParameters) => Promise<Array<Property>>,
 *   getAgentListings: (agentId: string, parameters?: SearchParameters) => Promise<Array<Property>>,
 *   client: IDXClient
 * }} IDX methods and client instance.
 * @throws {Error} If `config.apiKey` is missing.
 */
export function createIDX(config) {
  const client = createClient(config);
  const methods = createMethods(client);

  return {
    ...methods,
    client
  };
}
