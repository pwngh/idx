import {
  SORT_OPTIONS,
  DEFAULT_PARAMS,
  PROPERTY_STATUS,
  ERROR_MESSAGES
} from '../shared/constants.js';

import { normalizeAgentData, normalizePropertyData } from '../shared/utils.js';

/**
 * Build the high-level IDX methods on top of a low-level resource client.
 *
 * Every method returns normalized data (see normalizePropertyData) rather
 * than raw RESO records.
 *
 * @param {IDXClient} client - Client from createClient; performs the actual HTTP requests.
 * @returns {Object} The IDX method collection: getListings, getPropertyDetails, getAgentDetails, getNearbyListings, searchProperties, getOfficeListings, and getAgentListings.
 */
export function createMethods(client) {
  /** Maps a response bundle to normalized properties; empty array when the bundle is missing. */
  const toProperties = (response) => response?.bundle?.map(normalizePropertyData) || [];

  /** Lists properties filtered by one key (e.g. office or agent), defaulting to Active status and PORTFOLIO_LIMIT results. */
  async function getListingsBy(filterKey, id, parameters) {
    /** @type {APIResponse} */
    const response = await client.properties.list({
      [filterKey]: id,
      limit: parameters.limit || DEFAULT_PARAMS.PORTFOLIO_LIMIT,
      status: parameters.status || PROPERTY_STATUS.ACTIVE,
      ...parameters
    });

    return toProperties(response);
  }

  /**
   * Retrieve a page of listings.
   *
   * Every SearchParameters field (minPrice, maxPrice, beds, baths,
   * propertyType, status, ...) passes through verbatim as a query param;
   * null/undefined values are dropped by the client. Defaults applied when
   * omitted: newest-first by ListingContractDate, limit 20, offset 0.
   *
   * @param {SearchParameters} [parameters] - Filters, paging, and sorting; caller values override the defaults.
   * @returns {Promise<{total: number, listings: Array<Property>}>} Total server-side match count and the normalized page of listings.
   * @throws {Error} If the API request fails.
   */
  async function getListings(parameters = {}) {
    /** @type {APIResponse} */
    const response = await client.properties.list({
      sortBy: parameters.sortBy || SORT_OPTIONS.DATE_DESC.field,
      order: parameters.order || SORT_OPTIONS.DATE_DESC.order,
      limit: parameters.limit || DEFAULT_PARAMS.LIMIT,
      offset: parameters.offset || 0,
      ...parameters
    });

    return { total: response?.total ?? 0, listings: toProperties(response) };
  }

  /**
   * Retrieve one listing by its MLS listing ID.
   *
   * @param {string} id - MLS listing identifier.
   * @returns {Promise<Property>} The normalized listing.
   * @throws {Error} If `id` is missing or the API request fails.
   */
  async function getPropertyDetails(id) {
    if (!id) throw new Error(ERROR_MESSAGES.MISSING_ID);
    /** @type {APIResponse} */
    const response = await client.properties.getById(id);
    return normalizePropertyData(response.bundle);
  }

  /**
   * Retrieve one agent by MLS agent ID.
   *
   * @param {string} id - MLS agent identifier.
   * @returns {Promise<Agent>} The agent record.
   * @throws {Error} If `id` is missing or the API request fails.
   */
  async function getAgentDetails(id) {
    if (!id) throw new Error(ERROR_MESSAGES.MISSING_ID);
    /** @type {APIResponse} */
    const response = await client.agents.getById(id);
    return normalizeAgentData(response.bundle);
  }

  /**
   * Find active listings around a geographic point.
   *
   * Queries up to 50 Active listings within the radius (sent with
   * units=miles).
   *
   * @param {number} lat - Latitude in decimal degrees; must be non-zero.
   * @param {number} lng - Longitude in decimal degrees; must be non-zero.
   * @param {number} [radius=5] - Search radius in miles; defaults to DEFAULT_PARAMS.RADIUS.
   * @returns {Promise<Array<Property>>} Normalized listings nearest the point.
   * @throws {Error} If either coordinate is missing or the API request fails.
   */
  async function getNearbyListings(lat, lng, radius = DEFAULT_PARAMS.RADIUS) {
    if (!lat || !lng) throw new Error(ERROR_MESSAGES.MISSING_COORDINATES);

    /** @type {APIResponse} */
    const response = await client.properties.nearby({
      lat,
      lng,
      radius,
      units: 'miles',
      limit: DEFAULT_PARAMS.NEARBY_LIMIT,
      status: PROPERTY_STATUS.ACTIVE
    });

    return toProperties(response);
  }

  /**
   * Search listings with a fixed, validated filter set.
   *
   * Unlike getListings, only the known SearchParameters fields are forwarded
   * (minPrice, maxPrice, beds, baths, propertyType, status, limit, offset,
   * sortBy, order); unrecognized keys are discarded. Defaults when omitted:
   * status Active, limit 20, offset 0, newest-first by ListingContractDate.
   *
   * @param {SearchParameters} [filters] - Search filters; caller values override the defaults.
   * @returns {Promise<Array<Property>>} Normalized listings matching the filters.
   * @throws {Error} If the API request fails.
   */
  async function searchProperties(filters = {}) {
    const validFilters = {
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      beds: filters.beds,
      baths: filters.baths,
      propertyType: filters.propertyType,
      status: filters.status || PROPERTY_STATUS.ACTIVE,
      limit: filters.limit || DEFAULT_PARAMS.LIMIT,
      offset: filters.offset || 0,
      sortBy: filters.sortBy || SORT_OPTIONS.DATE_DESC.field,
      order: filters.order || SORT_OPTIONS.DATE_DESC.order
    };

    /** @type {APIResponse} */
    const response = await client.properties.search(validFilters);
    return toProperties(response);
  }

  /**
   * Retrieve listings belonging to an office.
   *
   * Defaults when omitted: status Active, limit 100. Additional
   * SearchParameters pass through as query params.
   *
   * @param {string} officeId - MLS office identifier.
   * @param {SearchParameters} [parameters] - Extra filters; caller values override the defaults.
   * @returns {Promise<Array<Property>>} The office's normalized listings.
   * @throws {Error} If `officeId` is missing or the API request fails.
   */
  async function getOfficeListings(officeId, parameters = {}) {
    if (!officeId) throw new Error('Office ID is required');
    return getListingsBy('office', officeId, parameters);
  }

  /**
   * Retrieve listings belonging to an agent.
   *
   * Defaults when omitted: status Active, limit 100. Additional
   * SearchParameters pass through as query params.
   *
   * @param {string} agentId - MLS agent identifier.
   * @param {SearchParameters} [parameters] - Extra filters; caller values override the defaults.
   * @returns {Promise<Array<Property>>} The agent's normalized listings.
   * @throws {Error} If `agentId` is missing or the API request fails.
   */
  async function getAgentListings(agentId, parameters = {}) {
    if (!agentId) throw new Error('Agent ID is required');
    return getListingsBy('agent', agentId, parameters);
  }

  return {
    getListings,
    getPropertyDetails,
    getAgentDetails,
    getNearbyListings,
    searchProperties,
    getOfficeListings,
    getAgentListings
  };
}
