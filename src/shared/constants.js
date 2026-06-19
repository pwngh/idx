/** Root URL for the Bridge Interactive HAR (Houston MLS) REST API. */
export const API_BASE_URL = 'https://api.bridgedataoutput.com/api/v2/har';

/** RESO `PropertySubType` values accepted by the HAR listings endpoint. */
export const PROPERTY_TYPES = {
  SINGLE_FAMILY: 'SingleFamilyResidence',
  CONDO: 'Condominium',
  TOWNHOUSE: 'Townhouse',
  MULTI_FAMILY: 'MultiFamily',
  LOT: 'Lot',
  FARM: 'Farm',
  MANUFACTURED: 'ManufacturedHome'
};

/** RESO `StandardStatus` values used to filter listings by lifecycle stage. */
export const PROPERTY_STATUS = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  SOLD: 'Sold',
  WITHDRAWN: 'Withdrawn',
  EXPIRED: 'Expired'
};

/** Sort presets mapping a UI choice to the RESO field and direction sent as `sortBy`/`order`. */
export const SORT_OPTIONS = {
  PRICE_ASC: { field: 'ListPrice', order: 'asc' },
  PRICE_DESC: { field: 'ListPrice', order: 'desc' },
  DATE_ASC: { field: 'ListingContractDate', order: 'asc' },
  DATE_DESC: { field: 'ListingContractDate', order: 'desc' },
  BEDS_ASC: { field: 'BedroomsTotal', order: 'asc' },
  BEDS_DESC: { field: 'BedroomsTotal', order: 'desc' },
  SQFT_ASC: { field: 'LivingArea', order: 'asc' },
  SQFT_DESC: { field: 'LivingArea', order: 'desc' }
};

/** Bridge API resource paths, appended to {@link API_BASE_URL}. */
export const API_ENDPOINTS = {
  PROPERTIES: 'listings',
  OFFICES: 'offices',
  AGENTS: 'agents',
  MEDIA: 'Media'
};

/**
 * Fallback query values applied when the caller omits a parameter.
 * RADIUS is in miles; PORTFOLIO_LIMIT caps office/agent listing pages.
 */
export const DEFAULT_PARAMS = {
  LIMIT: 20,
  NEARBY_LIMIT: 50,
  PORTFOLIO_LIMIT: 100,
  RADIUS: 5,
  MAX_PRICE: 100000000,
  MIN_PRICE: 0
};

/** User-facing error strings thrown by the client and method layers. */
export const ERROR_MESSAGES = {
  MISSING_ID: 'Property ID is required',
  MISSING_COORDINATES: 'Latitude and longitude are required',
  MISSING_REQUIRED_FIELDS: (fields) => `Missing required fields: ${fields.join(', ')}`,
  API_ERROR: 'Failed to fetch data from IDX service'
};

/** Listing photo size presets (width x height) and the placeholder shown when a listing has no media. */
export const PHOTO_CONFIG = {
  THUMB_SIZE: '300x200',
  MEDIUM_SIZE: '800x600',
  LARGE_SIZE: '1600x1200',
  DEFAULT_PHOTO: '/placeholder-home.jpg'
};
