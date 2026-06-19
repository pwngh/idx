/**
 * Shared Storybook fixtures.
 *
 * These objects mirror the normalized `Property` shape produced by
 * `normalizePropertyData` (src/shared/utils.js) — the exact shape the
 * components receive in a real app. Notably `features.baths` is an object,
 * `price` is a raw number alongside the preformatted `priceFormatted`, photo
 * URLs live on `photo.url`, and `dates.*` are real `Date` instances.
 *
 * Import these in stories instead of hand-writing partial mocks so every story
 * exercises the real contract.
 */
import { formatPrice } from '../../shared/utils';

/** Stable, real placeholder photos so list/gallery stories actually show images. */
function makePhotos(seed, count = 6) {
  return Array.from({ length: count }, (_, i) => ({
    mediaKey: `${seed}-media-${i}`,
    resourceRecordKey: seed,
    url: `https://picsum.photos/seed/${seed}-${i}/1200/800`,
    resourceName: 'Property',
    className: 'Photo',
    mimeType: 'image/jpeg',
    shortDescription: ['Front', 'Living room', 'Kitchen', 'Primary bedroom', 'Bathroom', 'Backyard'][i % 6],
    order: i
  }));
}

/**
 * Build a normalized Property fixture, deep-merging a few common overrides.
 *
 * @param {Object} [overrides] - Top-level fields to override; `features`, `address`,
 *   `dates`, and `details` are shallow-merged one level deep for convenience.
 * @returns {import('../../shared/types').Property}
 */
export function makeProperty(overrides = {}) {
  const id = overrides.id ?? '4815162342';
  const price = overrides.price ?? 575000;
  const sqft = overrides.features?.sqft ?? 2450;

  return {
    id,
    status: 'Active',
    price,
    priceFormatted: formatPrice(price),
    priceSqFt: sqft ? formatPrice(price / sqft, { maximumFractionDigits: 0 }) : '',
    mlsArea: 'Houston Heights',
    annualTaxes: 9800,
    associationFee: 250,
    associationFeeFrequency: 'Monthly',
    ...overrides,
    address: {
      complete: '1421 Cortlandt St, Houston, TX 77008',
      street: '1421 Cortlandt St',
      city: 'Houston',
      state: 'TX',
      zip: '77008',
      streetNumber: '1421',
      ...overrides.address
    },
    listingAgent: {
      mlsId: 'AGENT0042',
      name: 'Taylor Brooks',
      phone: '(555) 014-2200',
      officeName: 'Lonestar Realty Group',
      // `email` is not part of the normalized shape, but consumers commonly
      // attach it; AgentCard renders it when present.
      email: 'taylor.brooks@example.com',
      ...overrides.listingAgent
    },
    school: {
      district: 'Westfield ISD',
      high: 'Riverside High School',
      middle: 'Oakwood Middle School',
      elementary: 'Maplewood Elementary',
      ...overrides.school
    },
    features: {
      beds: 4,
      sqft,
      lot: { size: 6600, description: ['Subdivision Lot'], acres: 0.15 },
      yearBuilt: 2016,
      stories: 2,
      view: ['City'],
      interior: ['Crown Molding', 'High Ceilings', 'Walk-In Closet(s)'],
      appliances: ['Dishwasher', 'Disposal', 'Gas Range', 'Microwave'],
      laundry: ['Utility Room in House'],
      floor: ['Engineered Wood', 'Tile'],
      architecturalStyle: ['Traditional'],
      roof: ['Composition'],
      sewer: ['Public Sewer'],
      fireplace: { flag: true, description: ['Gas Log'] },
      cooling: { flag: true, description: ['Central Electric'] },
      heating: { flag: true, description: ['Central Gas'] },
      garage: { flag: true, spaces: 2, attached: true },
      parking: { description: ['Attached'], spaces: 2 },
      pool: { flag: false, description: [] },
      ...overrides.features,
      baths: { total: 3.5, full: 3, half: 1, ...overrides.features?.baths }
    },
    photos: overrides.photos ?? makePhotos(`idx-${id}`, 6),
    geo: {
      lat: 29.7989,
      lng: -95.4107,
      county: 'Harris',
      zip: '77008',
      area: 'Houston Heights',
      ...overrides.geo
    },
    dates: {
      listed: new Date('2024-03-12'),
      modified: new Date('2024-04-02'),
      daysOnMarket: 21,
      ...overrides.dates
    },
    details: {
      type: 'Single-Family',
      subType: 'SingleFamilyResidence',
      description:
        'Striking two-story in the heart of the Heights. Open-concept living with white oak floors, a chef’s kitchen, and a covered back porch overlooking a low-maintenance yard. Walk to local shops, parks, and the hike-and-bike trail.',
      features: [],
      amenities: '',
      ...overrides.details
    }
  };
}

/** Canonical, fully-populated active listing with photos. */
export const mockProperty = makeProperty();

/** Listing with no media — exercises placeholder rendering. */
export const mockPropertyNoPhoto = makeProperty({
  id: '1000000001',
  photos: [],
  address: { street: '88 Empty Lot Ln', complete: '88 Empty Lot Ln, Katy, TX 77494' }
});

/** Sold listing — exercises non-active status styling. */
export const mockPropertySold = makeProperty({
  id: '1000000002',
  status: 'Sold',
  price: 689000,
  address: { street: '204 Sold Oak Dr', city: 'Sugar Land', zip: '77479' }
});

/** Pending listing. */
export const mockPropertyPending = makeProperty({
  id: '1000000003',
  status: 'Pending',
  price: 432500,
  features: { beds: 3, sqft: 1820, baths: { total: 2, full: 2, half: 0 } },
  address: { street: '57 Pending Pine Ct', city: 'Pearland', zip: '77584' }
});

/** Sparse listing — empty agent/school/details/photos; exercises empty-state guards. */
export const mockPropertyMinimal = makeProperty({
  id: '1000000005',
  status: '',
  photos: [],
  listingAgent: { mlsId: '', name: '', phone: '', officeName: '', email: '' },
  school: { district: '', high: '', middle: '', elementary: '' },
  features: {
    beds: 0,
    baths: { total: 0, full: 0, half: 0 },
    sqft: 0,
    yearBuilt: null,
    interior: [],
    appliances: [],
    laundry: [],
    floor: [],
    architecturalStyle: [],
    roof: [],
    sewer: [],
    fireplace: { flag: null, description: [] },
    cooling: { flag: null, description: [] },
    heating: { flag: null, description: [] },
    lot: { size: 0, description: [], acres: 0 }
  },
  details: { type: '', subType: '', description: '', features: [], amenities: '' }
});

/** Listing with an unusually long street name — exercises text wrapping. */
export const mockPropertyLongAddress = makeProperty({
  id: '1000000004',
  address: {
    street: '12509 Northwest Meadowbrook Estates Boulevard Unit 4B',
    city: 'The Woodlands',
    zip: '77381'
  }
});

const STREETS = [
  ['1421 Cortlandt St', 'Houston', '77008', 575000, 4, { total: 3.5, full: 3, half: 1 }, 2450],
  ['908 Heights Blvd', 'Houston', '77008', 829000, 4, { total: 3, full: 3, half: 0 }, 3120],
  ['57 Pending Pine Ct', 'Pearland', '77584', 432500, 3, { total: 2, full: 2, half: 0 }, 1820],
  ['204 Sold Oak Dr', 'Sugar Land', '77479', 689000, 5, { total: 4, full: 4, half: 0 }, 3680],
  ['3300 Kirby Dr #12', 'Houston', '77098', 365000, 2, { total: 2, full: 2, half: 0 }, 1340],
  ['15 Lakefront Way', 'Katy', '77494', 1250000, 5, { total: 4.5, full: 4, half: 1 }, 4820]
];

/** A small, varied set of listings for grid/list stories. */
export const mockProperties = STREETS.map(([street, city, zip, price, beds, baths, sqft], i) =>
  makeProperty({
    id: `200000000${i}`,
    price,
    status: ['Active', 'Active', 'Pending', 'Sold', 'Active', 'Active'][i],
    address: { street, city, zip },
    features: { beds, baths, sqft }
  })
);

/** A larger set for pagination / long-list stories. */
export const manyProperties = Array.from({ length: 27 }, (_, i) =>
  makeProperty({
    id: `300000${String(i).padStart(3, '0')}`,
    price: 300000 + ((i * 53700) % 900000),
    status: ['Active', 'Active', 'Active', 'Pending', 'Sold'][i % 5],
    address: {
      street: `${1200 + i * 7} ${STREETS[i % STREETS.length][0].split(' ').slice(1).join(' ')}`,
      city: STREETS[i % STREETS.length][1],
      zip: STREETS[i % STREETS.length][2]
    },
    features: {
      beds: 2 + (i % 4),
      sqft: 1400 + ((i * 137) % 3200),
      baths: { total: 2 + (i % 3), full: 2 + (i % 3), half: i % 2 }
    }
  })
);

/** Photo array for the gallery story (more images than a single card uses). */
export const galleryPhotos = makePhotos('idx-gallery', 9);
