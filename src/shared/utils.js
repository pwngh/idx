import {
  DEFAULT_PARAMS,
  ERROR_MESSAGES,
  PHOTO_CONFIG,
  PROPERTY_STATUS,
  SORT_OPTIONS
} from './constants.js';

/**
 * Assert that a property object contains every required field.
 *
 * @param {Object} property - Candidate property object.
 * @param {Array<string>} [requiredFields] - Fields that must be truthy; defaults to ['id', 'address', 'price'].
 * @returns {boolean} Always true when validation passes.
 * @throws {Error} Listing the missing field names when any are absent.
 */
export function validatePropertyData(property, requiredFields = ['id', 'address', 'price']) {
  const missing = requiredFields.filter(field => !property?.[field]);

  if (missing.length > 0) {
    throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS(missing));
  }

  return true;
}

/**
 * Coerce a price into a plain number, stripping currency symbols and separators.
 *
 * @param {number|string|null|undefined} price - Raw price; '$450,000' becomes 450000.
 * @returns {number} Numeric price; 0 for empty input, NaN for non-numeric strings.
 */
export function parsePrice(price) {
  if (!price) return 0;
  return typeof price === 'string' ?
    parseInt(price.replace(/[^0-9.-]+/g, '')) :
    price;
}

/**
 * Format a price as a US-dollar currency string with no cents.
 *
 * @param {number|string} price - Raw price; parsed with parsePrice first.
 * @param {Object} [options] - Intl.NumberFormat overrides, e.g. { maximumFractionDigits: 2 }.
 * @returns {string} Formatted price such as '$450,000'; '$NaN' when the input cannot be parsed to a number.
 */
export function formatPrice(price, options = {}) {
  const value = parsePrice(price);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    ...options
  }).format(value);
}

/**
 * Format a square-footage value for display.
 *
 * @param {number|string} sqft - Interior area in square feet.
 * @returns {string} Localized string such as '2,500 sq ft'; '0 sq ft' for empty input.
 */
export function formatArea(sqft) {
  if (!sqft) return '0 sq ft';
  return `${Number(sqft).toLocaleString()} sq ft`;
}

/**
 * Render an address as a single comma-separated line.
 *
 * @param {string|PropertyAddress} address - Pre-formatted strings pass through unchanged; objects are joined from street, city, state, zip, skipping blanks.
 * @returns {string} Single-line address.
 */
export function formatAddress(address) {
  if (typeof address === 'string') return address;

  const parts = [
    address.street,
    address.city,
    address.state,
    address.zip
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * Resolve a photo URL at the requested size.
 *
 * Bridge media URLs embed their dimensions (e.g. '800x600'), which this swaps
 * for the requested size preset.
 *
 * @param {Photo} photo - Normalized photo object.
 * @param {string} [size] - Target 'WIDTHxHEIGHT' preset; defaults to PHOTO_CONFIG.MEDIUM_SIZE ('800x600').
 * @returns {string} Resized photo URL, or the placeholder image when the photo has no URL.
 */
export function getPhotoUrl(photo, size = PHOTO_CONFIG.MEDIUM_SIZE) {
  if (!photo?.url) return PHOTO_CONFIG.DEFAULT_PHOTO;
  return photo.url.replace(/(\d+x\d+)/, size);
}

/**
 * Map a raw RESO listing record onto the package's normalized Property shape.
 *
 * Every field is defaulted, so missing or null source data yields a stable
 * shape rather than undefined: most fields fall back to empty strings, zeros,
 * or empty arrays, while id, yearBuilt, and the boolean/count flags default to
 * null.
 *
 * @param {RawProperty} property - Raw record from the Bridge listings endpoint.
 * @returns {Property} Normalized listing.
 */
export function normalizePropertyData(property) {
  return {
    id: property?.ListingId ?? null,
    status: property?.StandardStatus ?? "",
    price: parsePrice(property?.ListPrice) || 0,
    priceFormatted: formatPrice(property?.ListPrice),
    priceSqFt: property?.LivingArea
      ? formatPrice(property?.ListPrice / property?.LivingArea, { maximumFractionDigits: 2 })
      : "",
    mlsArea: property?.MLSAreaMajor || "",
    annualTaxes: property?.TaxAnnualAmount || 0,
    associationFee: property?.AssociationFee || 0,
    associationFeeFrequency: property?.AssociationFeeFrequency || "",
    address: {
      complete: property?.UnparsedAddress || "",
      street: (property?.UnparsedAddress?.match(/^(.*?)(?:,|\s+[A-Z]{2}\s)/)?.[1] || "").trim(),
      city: property?.City || "",
      state: property?.StateOrProvince || "",
      zip: property?.PostalCode || "",
      streetNumber: property?.StreetNumber || ""
    },
    listingAgent: {
      mlsId: property?.ListAgentMlsId ?? "",
      name: property?.ListAgentFullName ?? "",
      phone: property?.ListAgentPreferredPhone ?? "",
      officeName: property?.ListOfficeName ?? ""
    },
    school: {
      district: property?.HighSchoolDistrict || "",
      high: property?.HighSchool || "",
      middle: property?.MiddleOrJuniorSchool || "",
      elementary: property?.ElementarySchool || ""
    },
    features: {
      beds: parseInt(property?.BedroomsTotal) || 0,
      baths: {
        total: parseFloat(property?.BathroomsTotalInteger || "0"),
        full: parseFloat(property?.BathroomsFull || "0"),
        half: parseFloat(property?.BathroomsHalf || "0")
      },
      sqft: parseInt(property?.LivingArea) || 0,
      lot: {
        size: property?.LotSizeArea || 0,
        description: property?.LotFeatures || [],
        acres: property?.LotSizeAcres || 0
      },
      exterior: property?.ExteriorFeatures || [],
      interior: property?.InteriorFeatures || [],
      yearBuilt: property?.YearBuilt ?? null,
      stories: property?.StoriesTotal || 0,
      view: property?.View || [],
      appliances: property?.Appliances || [],
      laundry: property?.LaundryFeatures || [],
      floor: property?.Flooring || [],
      architecturalStyle: property?.ArchitecturalStyle || [],
      roof: property?.Roof || [],
      sewer: property?.Sewer || [],
      fireplace: {
        flag: property?.FireplaceYN ?? null,
        description: property?.FireplaceFeatures || []
      },
      cooling: {
        flag: property?.CoolingYN ?? null,
        description: property?.Cooling || []
      },
      heating: {
        flag: property?.HeatingYN ?? null,
        description: property?.Heating || []
      },
      garage: {
        flag: property?.GarageYN ?? null,
        spaces: property?.GarageSpaces ?? null,
        attached: property?.AttachedGarageYN ?? null
      },
      parking: {
        description: property?.ParkingFeatures || [],
        spaces: property?.ParkingTotal ?? null
      },
      waterSource: property?.WaterSource || [],
      pool: {
        flag: property?.HAR_PoolArea ?? null,
        description: property?.PoolFeatures || []
      },
      greenEnergyEfficient: property?.GreenEnergyEfficient || [],
      carportYN: property?.CarportYN ?? null,
      spaFlag: property?.SpaYN ?? null,
      newConstructionYN: property?.NewConstructionYN ?? null,
      depositSecurity: property?.HAR_DepositSecurity ?? null,
      applicationFee: property?.HAR_ApplicationFee ?? null,
      coveredSpaces: property?.CoveredSpaces ?? null,
      petDepositDescription: property?.HAR_PetDepositDescription || "",
      yearBuiltSource: property?.YearBuiltSource || "",
      fireplacesTotal: property?.FireplacesTotal ?? null,
      fencing: property?.Fencing || [],
      patioAndPorchFeatures: property?.PatioAndPorchFeatures || [],
      constructionMaterials: property?.ConstructionMaterials || [],
      roadSurfaceType: property?.RoadSurfaceType || [],
      foundationDetails: property?.FoundationDetails || [],
      communityFeatures: property?.CommunityFeatures || [],
      roomMasterBathroomFeatures: property?.RoomMasterBathroomFeatures || [],
      utilities: property?.Utilities || [],
      structureType: property?.StructureType || [],
      roomKitchenFeatures: property?.RoomKitchenFeatures || [],
      levels: property?.Levels || [],
      windowFeatures: property?.WindowFeatures || [],
      waterfrontFeatures: property?.WaterfrontFeatures || [],
      otherStructures: property?.OtherStructures || []
    },
    photos: normalizePhotos(property?.Media),
    geo: {
      lat: parseFloat(property?.Latitude) || 0,
      lng: parseFloat(property?.Longitude) || 0,
      county: property?.CountyOrParish,
      zip: property?.PostalCode,
      area: property?.MLSAreaMajor
    },
    dates: {
      listed: property?.ListingContractDate ? new Date(property.ListingContractDate) : null,
      modified: property?.ModificationTimestamp ? new Date(property.ModificationTimestamp) : null,
      daysOnMarket: property?.DaysOnMarket || 0
    },
    details: {
      type: property?.PropertyType || "",
      subType: property?.PropertySubType || "",
      description: property?.PublicRemarks || "",
      features: property?.Features || [],
      amenities: property?.Amenities || ""
    }
  };
}

/**
 * Normalize a raw RESO Member record into an Agent.
 *
 * Currently a shallow copy: Bridge agent records are passed through unmodified.
 *
 * @param {Object} agent - Raw record from the Bridge agents endpoint.
 * @returns {Agent} Agent record.
 */
export function normalizeAgentData(agent) {
  return {
    ...agent
  };
}

/**
 * Convert raw Media records into normalized photo objects.
 *
 * Entries without a MediaURL are dropped; the rest keep their original order.
 *
 * @param {Array<RawMedia>} [photos] - Raw media records; non-array input yields [].
 * @returns {Array<Photo>} Normalized photos with zero-based `order`.
 */
export function normalizePhotos(photos = []) {
  if (!Array.isArray(photos)) return [];

  return photos
    .filter(photo => photo?.MediaURL)
    .map((photo, index) => ({
      mediaKey: photo.MediaKey,
      resourceRecordKey: photo.ResourceRecordKey,
      url: photo.MediaURL,
      resourceName: photo.ResourceName || '',
      className: photo.ClassName || '',
      mimeType: photo.MimeType || '',
      shortDescription: photo.ShortDescription || '',
      order: index
    }));
}

/**
 * Delay invoking a function until calls have stopped for the given interval.
 *
 * Each call resets the timer; only the latest arguments are used.
 *
 * @param {Function} func - Function to debounce.
 * @param {number} [wait=300] - Quiet period in milliseconds.
 * @returns {Function} Debounced wrapper with a `.cancel()` method that drops any pending call.
 */
export function debounce(func, wait = 300) {
  let timeout;
  const debounced = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
}

/**
 * Read search filters from URL query params, applying package defaults.
 *
 * Missing price bounds fall back to DEFAULT_PARAMS, status to 'Active', and
 * sort to newest-first by listing date.
 *
 * @param {URLSearchParams} params - Query params, e.g. from a Remix loader's request URL.
 * @returns {SearchParameters} Filters ready to pass to the search methods.
 */
export function parseSearchParams(params) {
  return {
    minPrice: params.get('minPrice') || DEFAULT_PARAMS.MIN_PRICE,
    maxPrice: params.get('maxPrice') || DEFAULT_PARAMS.MAX_PRICE,
    beds: params.get('beds'),
    baths: params.get('baths'),
    propertyType: params.get('propertyType'),
    status: params.get('status') || PROPERTY_STATUS.ACTIVE,
    sortBy: params.get('sortBy') || SORT_OPTIONS.DATE_DESC.field,
    order: params.get('order') || SORT_OPTIONS.DATE_DESC.order
  };
}

/**
 * Format a numeric value for compact display, dropping trailing zeros.
 *
 * Integers render without decimals; fractional values keep a single decimal
 * place, so bed/bath counts like 2 and 2.5 both read cleanly.
 *
 * @param {number|string} num - Value to format; strings are parsed as floats.
 * @returns {string} Formatted number such as '2' or '2.5'; '0' for empty or non-numeric input.
 */
export function formatNumber(num) {
  const value = parseFloat(num);
  if (Number.isNaN(value)) return '0';
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

/**
 * Resolve a total bathroom count from the normalized `features.baths` field.
 *
 * `normalizePropertyData` stores baths as an object ({ total, full, half }),
 * but loosely-typed callers sometimes pass a plain number. This accepts either.
 *
 * @param {{total?: number}|number|null|undefined} baths - Normalized baths object or a raw count.
 * @returns {number} Total bathrooms; 0 when unknown.
 */
export function getBathCount(baths) {
  if (baths == null) return 0;
  if (typeof baths === 'object') return Number(baths.total) || 0;
  return Number(baths) || 0;
}

/**
 * Format a date as a long, human-readable string.
 *
 * @param {Date|string|number|null|undefined} date - Date instance or any value the Date constructor accepts.
 * @returns {string} Formatted date such as 'January 5, 2024'; empty string for missing or invalid input.
 */
export function formatDate(date) {
  if (!date) return '';
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(parsed);
}

/**
 * Report whether a value is "empty" for display purposes.
 *
 * Treats null, undefined, false, 0, '', '0', empty arrays, and objects with no
 * own enumerable keys as empty. Mirrors the guard used across the property
 * detail components so blank MLS fields are skipped rather than rendered.
 *
 * @param {*} value - Value to test.
 * @returns {boolean} True when the value should be considered empty.
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (value === false || value === 0 || value === '' || value === '0') return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Derive up-to-two uppercase initials from a person's name.
 *
 * @param {string} name - Full name, e.g. 'Jane Doe'.
 * @returns {string} Initials such as 'JD'; '?' for empty or non-string input.
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
