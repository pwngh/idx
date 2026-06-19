import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  parsePrice,
  formatPrice,
  formatArea,
  formatAddress,
  getPhotoUrl,
  normalizePhotos,
  normalizePropertyData,
  parseSearchParams,
  validatePropertyData
} from '../src/shared/utils.js';

test('parsePrice strips currency formatting and passes numbers through', () => {
  assert.equal(parsePrice('$450,000'), 450000);
  assert.equal(parsePrice(450000), 450000);
  assert.equal(parsePrice(null), 0);
  assert.equal(parsePrice(''), 0);
});

test('formatPrice renders whole-dollar USD by default and accepts Intl overrides', () => {
  assert.equal(formatPrice(450000), '$450,000');
  assert.equal(formatPrice('$1,200'), '$1,200');
  assert.equal(formatPrice(123.456, { maximumFractionDigits: 2 }), '$123.46');
});

test('formatArea appends the unit and falls back to zero', () => {
  assert.equal(formatArea(950), '950 sq ft');
  assert.equal(formatArea(null), '0 sq ft');
  assert.equal(formatArea(0), '0 sq ft');
});

test('formatAddress joins object parts and passes strings through', () => {
  assert.equal(formatAddress('123 Main St, Houston, TX 77002'), '123 Main St, Houston, TX 77002');
  assert.equal(
    formatAddress({ street: '123 Main St', city: 'Houston', state: 'TX', zip: '77002' }),
    '123 Main St, Houston, TX, 77002'
  );
  assert.equal(formatAddress({ street: '123 Main St', city: 'Houston' }), '123 Main St, Houston');
});

test('getPhotoUrl swaps the embedded dimensions and falls back to the placeholder', () => {
  const photo = { url: 'https://cdn.example.com/photo-1600x1200.jpg' };

  assert.equal(getPhotoUrl(photo), 'https://cdn.example.com/photo-800x600.jpg');
  assert.equal(getPhotoUrl(photo, '300x200'), 'https://cdn.example.com/photo-300x200.jpg');
  assert.equal(getPhotoUrl(null), '/placeholder-home.jpg');
  assert.equal(getPhotoUrl({}), '/placeholder-home.jpg');
});

test('normalizePhotos drops entries without a MediaURL and orders the rest', () => {
  const photos = normalizePhotos([
    { MediaKey: 'a', MediaURL: 'https://cdn.example.com/a.jpg' },
    { MediaKey: 'broken' },
    { MediaKey: 'b', MediaURL: 'https://cdn.example.com/b.jpg', ShortDescription: 'Kitchen' }
  ]);

  assert.equal(photos.length, 2);
  assert.deepEqual(photos.map((p) => p.order), [0, 1]);
  assert.equal(photos[0].url, 'https://cdn.example.com/a.jpg');
  assert.equal(photos[1].shortDescription, 'Kitchen');
});

test('normalizePhotos returns an empty array for non-array input', () => {
  assert.deepEqual(normalizePhotos(undefined), []);
  assert.deepEqual(normalizePhotos('not-an-array'), []);
});

test('normalizePropertyData defaults every field for an empty record', () => {
  const property = normalizePropertyData({});

  assert.equal(property.id, null);
  assert.equal(property.status, '');
  assert.equal(property.price, 0);
  assert.equal(property.features.beds, 0);
  assert.deepEqual(property.photos, []);
  assert.equal(property.geo.lat, 0);
  assert.equal(property.dates.listed, null);
});

test('normalizePropertyData maps core RESO fields', () => {
  const property = normalizePropertyData({
    ListingId: 'HAR123',
    StandardStatus: 'Active',
    ListPrice: 450000,
    UnparsedAddress: '123 Main St, Houston TX 77002',
    City: 'Houston',
    BedroomsTotal: 3,
    LivingArea: 1800,
    Latitude: '29.7604',
    Longitude: '-95.3698'
  });

  assert.equal(property.id, 'HAR123');
  assert.equal(property.status, 'Active');
  assert.equal(property.price, 450000);
  assert.equal(property.priceFormatted, '$450,000');
  assert.equal(property.address.street, '123 Main St');
  assert.equal(property.address.city, 'Houston');
  assert.equal(property.features.beds, 3);
  assert.equal(property.features.sqft, 1800);
  assert.equal(property.geo.lat, 29.7604);
  assert.equal(property.geo.lng, -95.3698);
});

test('parseSearchParams applies defaults for missing query params', () => {
  const filters = parseSearchParams(new URLSearchParams(''));

  assert.equal(filters.minPrice, 0);
  assert.equal(filters.maxPrice, 100000000);
  assert.equal(filters.status, 'Active');
  assert.equal(filters.sortBy, 'ListingContractDate');
  assert.equal(filters.order, 'desc');
});

test('parseSearchParams reads explicit query params', () => {
  const filters = parseSearchParams(
    new URLSearchParams('minPrice=100000&maxPrice=300000&beds=3&status=Sold&order=asc')
  );

  assert.equal(filters.minPrice, '100000');
  assert.equal(filters.maxPrice, '300000');
  assert.equal(filters.beds, '3');
  assert.equal(filters.status, 'Sold');
  assert.equal(filters.order, 'asc');
});

test('validatePropertyData passes complete objects and names the missing fields', () => {
  assert.equal(validatePropertyData({ id: 'x', address: 'a', price: 1 }), true);
  assert.throws(
    () => validatePropertyData({ id: 'x' }),
    /Missing required fields: address, price/
  );
});
