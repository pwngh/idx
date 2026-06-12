import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildApiUrl, createClient } from '../src/node/client.js';

test('buildApiUrl targets the HAR dataset and authenticates with the injected apiKey', () => {
  const url = buildApiUrl({ apiKey: 'test-key' }, 'listings');

  assert.equal(url.origin, 'https://api.bridgedataoutput.com');
  assert.equal(url.pathname, '/api/v2/har/listings');
  assert.equal(url.searchParams.get('access_token'), 'test-key');
});

test('buildApiUrl serializes defined params and omits null/undefined ones', () => {
  const url = buildApiUrl({ apiKey: 'k' }, 'listings', {
    minPrice: 0,
    maxPrice: 500000,
    beds: null,
    baths: undefined
  });

  assert.equal(url.searchParams.get('minPrice'), '0');
  assert.equal(url.searchParams.get('maxPrice'), '500000');
  assert.equal(url.searchParams.has('beds'), false);
  assert.equal(url.searchParams.has('baths'), false);
});

test('buildApiUrl supports nested by-id resource paths', () => {
  const url = buildApiUrl({ apiKey: 'k' }, 'listings/HAR123');

  assert.equal(url.pathname, '/api/v2/har/listings/HAR123');
});

test('createClient throws without an apiKey', () => {
  assert.throws(() => createClient(), /API key is required/);
  assert.throws(() => createClient({}), /API key is required/);
});
