/**
 * @typedef {Object} APIResponse
 * @property {Array<RawProperty>|RawProperty} bundle - Payload: an array for collection
 *   endpoints, a single record for by-ID endpoints.
 * @property {number} total - Total matches on the server, independent of `limit`/`offset`.
 */

/**
 * @typedef {Object} RawProperty
 * RESO Property record as returned by Bridge. Non-exhaustive; only the most
 * commonly read fields are listed.
 * @property {string} ListingId - MLS listing identifier.
 * @property {string} StandardStatus - Lifecycle status, e.g. 'Active'.
 * @property {number} ListPrice - Asking price in USD.
 * @property {string} UnparsedAddress - Full single-line street address.
 * @property {string} City
 * @property {string} StateOrProvince
 * @property {string} PostalCode
 * @property {number} BedroomsTotal
 * @property {number} BathroomsTotalInteger
 * @property {number} LivingArea - Interior area in square feet.
 * @property {string} YearBuilt
 * @property {number} Latitude
 * @property {number} Longitude
 * @property {string} ListingContractDate - ISO date the listing went live.
 * @property {string} ModificationTimestamp - ISO timestamp of the last MLS update.
 * @property {number} DaysOnMarket
 * @property {Array<RawMedia>} Media - Listing photos and attachments.
 */

/**
 * @typedef {Object} RawMedia
 * @property {string} MediaKey - Unique media identifier.
 * @property {string} ResourceRecordKey - Key of the listing this media belongs to.
 * @property {string} MediaURL - Absolute URL of the asset.
 * @property {string} [ResourceName]
 * @property {string} [ClassName]
 * @property {string} [MimeType]
 * @property {string} [ShortDescription]
 */

/**
 * @typedef {Object} Photo
 * Normalized listing photo produced from a {@link RawMedia} record.
 * @property {string} mediaKey
 * @property {string} resourceRecordKey
 * @property {string} url - Absolute URL of the asset.
 * @property {string} resourceName
 * @property {string} className
 * @property {string} mimeType
 * @property {string} shortDescription
 * @property {number} order - Zero-based display position.
 */

/**
 * @typedef {Object} ClientConfig
 * @property {string} apiKey - Bridge API access token; sent as the `access_token` query param.
 * @property {Object} [headers] - Request headers; when supplied, replaces the JSON defaults entirely.
 */

/**
 * @typedef {Object} IDXClient
 * Low-level resource client returned by `createClient`. Each resource exposes
 * `list(params)` and `getById(id, params)`; `properties` adds `search` and `nearby`.
 * @property {{list: function(Object): Promise<APIResponse>,
 *   getById: function(string, Object=): Promise<APIResponse>,
 *   search: function(Object): Promise<APIResponse>,
 *   nearby: function(Object): Promise<APIResponse>}} properties
 * @property {{list: function(Object): Promise<APIResponse>,
 *   getById: function(string, Object=): Promise<APIResponse>}} offices
 * @property {{list: function(Object): Promise<APIResponse>,
 *   getById: function(string, Object=): Promise<APIResponse>}} agents
 * @property {{list: function(Object): Promise<APIResponse>,
 *   getById: function(string, Object=): Promise<APIResponse>}} media
 */

/**
 * @typedef {Object} PropertyAddress
 * @property {string} complete - Full single-line address.
 * @property {string} street - Street portion only.
 * @property {string} city
 * @property {string} state
 * @property {string} zip
 * @property {string} streetNumber
 */

/**
 * @typedef {Object} PropertyFeatures
 * Non-exhaustive; mirrors the `features` block built by `normalizePropertyData`.
 * @property {number} beds
 * @property {{total: number, full: number, half: number}} baths
 * @property {number} sqft - Interior area in square feet.
 * @property {{size: number, description: Array<string>, acres: number}} lot
 * @property {number|null} yearBuilt
 * @property {number} stories
 * @property {{flag: boolean|null, spaces: number|null, attached: boolean|null}} garage
 * @property {{flag: boolean|null, description: Array<string>}} pool
 */

/**
 * @typedef {Object} PropertyGeo
 * @property {number} lat
 * @property {number} lng
 * @property {string} county
 * @property {string} zip
 * @property {string} area - MLS major area name.
 */

/**
 * @typedef {Object} PropertyDates
 * @property {Date|null} listed - When the listing contract started.
 * @property {Date|null} modified - Last MLS modification.
 * @property {number} daysOnMarket
 */

/**
 * @typedef {Object} Property
 * Normalized listing produced by `normalizePropertyData`.
 * @property {string|null} id - MLS listing identifier.
 * @property {string} status - RESO `StandardStatus` value.
 * @property {number} price - Asking price in USD.
 * @property {string} priceFormatted - Price as a US currency string.
 * @property {string} priceSqFt - Price per square foot, formatted; empty when sqft is unknown.
 * @property {string} mlsArea - MLS major area name.
 * @property {number} annualTaxes - Annual tax amount in USD.
 * @property {number} associationFee - HOA/association fee.
 * @property {string} associationFeeFrequency - Billing cadence for the association fee.
 * @property {PropertyAddress} address
 * @property {{mlsId: string, name: string, phone: string, officeName: string}} listingAgent
 * @property {{district: string, high: string, middle: string, elementary: string}} school
 * @property {PropertyFeatures} features
 * @property {Array<Photo>} photos
 * @property {PropertyGeo} geo
 * @property {PropertyDates} dates
 * @property {{type: string, subType: string, description: string, features: Array<string>, amenities: string}} details
 */

/**
 * @typedef {Object} Agent
 * RESO Member record as returned by Bridge, passed through unmodified.
 */

/**
 * @typedef {Object} SearchParameters
 * @property {number} [minPrice] - Lower price bound in USD, inclusive.
 * @property {number} [maxPrice] - Upper price bound in USD, inclusive.
 * @property {number} [beds] - Minimum number of bedrooms.
 * @property {number} [baths] - Minimum number of bathrooms.
 * @property {string} [propertyType] - One of the PROPERTY_TYPES values.
 * @property {string} [status] - One of the PROPERTY_STATUS values.
 * @property {number} [limit] - Page size.
 * @property {number} [offset] - Number of results to skip.
 * @property {string} [sortBy] - RESO field to sort by.
 * @property {string} [order] - Sort direction: 'asc' or 'desc'.
 */
