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
 * @returns {string} Formatted price such as '$450,000'.
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
 * Every field is defaulted, so missing or null source data yields empty
 * strings, zeros, or empty arrays rather than undefined.
 *
 * @param {RawProperty} property - Raw record from the Bridge listings endpoint.
 * @returns {Property} Normalized listing.
 */
export function normalizePropertyData(property) {
  return {
    id: property?.ListingId ?? null,
    status: property?.StandardStatus ?? "",
    price: parsePrice(property?.ListPrice) || 0,
    priceFormatted: formatPrice(property?.ListPrice) || "",
    priceSqFt: property?.LivingArea
      ? formatPrice(property?.ListPrice / property?.LivingArea, { maximumFractionDigits: 2 })
      : "",
    mlsArea: property?.MLSAreaMajor || "",
    annualTaxes: property?.TaxAnnualAmount || 0,
    associationFee: property?.AssociationFee || 0,
    associationFeeFrequency: property?.AssociationFeeFrequency || "",
    address: {
      complete: property?.UnparsedAddress || "",
      street: extractStreet(property?.UnparsedAddress) || "",
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
    geo: extractGeoData(property),
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
 * Extract location fields from a raw listing record.
 *
 * @param {RawProperty} property - Raw record; must be non-null.
 * @returns {PropertyGeo} Coordinates (0 when unparseable) plus county, zip, and MLS area.
 */
export function extractGeoData(property) {
  return {
    lat: parseFloat(property.Latitude) || 0,
    lng: parseFloat(property.Longitude) || 0,
    county: property.CountyOrParish,
    zip: property.PostalCode,
    area: property.MLSAreaMajor
  };
}

/**
 * Delay invoking a function until calls have stopped for the given interval.
 *
 * Each call resets the timer; only the latest arguments are used.
 *
 * @param {Function} func - Function to debounce.
 * @param {number} [wait=300] - Quiet period in milliseconds.
 * @returns {Function} Debounced wrapper.
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
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
    sort: params.get('sort') || SORT_OPTIONS.DATE_DESC.field,
    order: params.get('order') || SORT_OPTIONS.DATE_DESC.order
  };
}

/** Extracts the street portion of an address: everything before the first comma or two-letter state code. */
function extractStreet(address) {
  if (!address || typeof address !== 'string') {
    return '';
  }

  const streetMatch = address.match(/^(.*?)(?:,|\s+[A-Z]{2}\s)/);
  return streetMatch ? streetMatch[1].trim() : '';
}
