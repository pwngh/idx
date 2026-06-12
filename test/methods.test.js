import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createMethods } from '../src/node/methods.js';

/** Builds a stub IDXClient that records every call and resolves with a canned response. */
function createStub(response = { total: 0, bundle: [] }) {
  const calls = [];
  const record = (name) => async (...args) => {
    calls.push({ name, args });
    return response;
  };

  const client = {
    properties: {
      list: record('properties.list'),
      getById: record('properties.getById'),
      search: record('properties.search'),
      nearby: record('properties.nearby')
    },
    agents: {
      list: record('agents.list'),
      getById: record('agents.getById')
    }
  };

  return { client, calls, methods: createMethods(client) };
}

test('getListings forwards minPrice and maxPrice as distinct query params', async () => {
  const { methods, calls } = createStub();

  await methods.getListings({ minPrice: 250000, maxPrice: 750000 });

  const [params] = calls[0].args;
  assert.equal(params.minPrice, 250000);
  assert.equal(params.maxPrice, 750000);
});

test('getListings applies default sort, order, limit, and offset', async () => {
  const { methods, calls } = createStub();

  await methods.getListings();

  const [params] = calls[0].args;
  assert.equal(params.sortBy, 'ListingContractDate');
  assert.equal(params.order, 'desc');
  assert.equal(params.limit, 20);
  assert.equal(params.offset, 0);
});

test('getListings lets caller parameters override the defaults', async () => {
  const { methods, calls } = createStub();

  await methods.getListings({ sortBy: 'ListPrice', order: 'asc', limit: 5, offset: 10 });

  const [params] = calls[0].args;
  assert.equal(params.sortBy, 'ListPrice');
  assert.equal(params.order, 'asc');
  assert.equal(params.limit, 5);
  assert.equal(params.offset, 10);
});

test('getListings returns the total and normalized listings', async () => {
  const { methods } = createStub({
    total: 42,
    bundle: [{ ListingId: 'HAR123', ListPrice: 450000, StandardStatus: 'Active' }]
  });

  const result = await methods.getListings();

  assert.equal(result.total, 42);
  assert.equal(result.listings.length, 1);
  assert.equal(result.listings[0].id, 'HAR123');
  assert.equal(result.listings[0].price, 450000);
  assert.equal(result.listings[0].status, 'Active');
});

test('getListings returns an empty page when the response has no bundle', async () => {
  const { methods } = createStub({});

  const result = await methods.getListings();

  assert.deepEqual(result, { total: 0, listings: [] });
});

test('getNearbyListings defaults the radius to 5 miles', async () => {
  const { methods, calls } = createStub();

  await methods.getNearbyListings(29.7604, -95.3698);

  const [params] = calls[0].args;
  assert.equal(calls[0].name, 'properties.nearby');
  assert.equal(params.radius, 5);
  assert.equal(params.units, 'miles');
  assert.equal(params.limit, 50);
  assert.equal(params.status, 'Active');
});

test('getNearbyListings respects an explicit radius', async () => {
  const { methods, calls } = createStub();

  await methods.getNearbyListings(29.7604, -95.3698, 12);

  const [params] = calls[0].args;
  assert.equal(params.radius, 12);
});

test('getNearbyListings rejects when coordinates are missing', async () => {
  const { methods } = createStub();

  await assert.rejects(() => methods.getNearbyListings(), /Latitude and longitude are required/);
  await assert.rejects(() => methods.getNearbyListings(29.7604), /Latitude and longitude are required/);
});

test('getPropertyDetails rejects when the id is missing', async () => {
  const { methods } = createStub();

  await assert.rejects(() => methods.getPropertyDetails(), /Property ID is required/);
});

test('searchProperties forwards known filters and discards unknown keys', async () => {
  const { methods, calls } = createStub();

  await methods.searchProperties({ minPrice: 100000, maxPrice: 300000, beds: 3, bogus: 'dropped' });

  const [params] = calls[0].args;
  assert.equal(calls[0].name, 'properties.search');
  assert.equal(params.minPrice, 100000);
  assert.equal(params.maxPrice, 300000);
  assert.equal(params.beds, 3);
  assert.equal(params.status, 'Active');
  assert.equal('bogus' in params, false);
});

test('getOfficeListings and getAgentListings scope the query and default the limit', async () => {
  const { methods, calls } = createStub();

  await methods.getOfficeListings('OFF1');
  await methods.getAgentListings('AGT1');

  const [officeParams] = calls[0].args;
  assert.equal(officeParams.office, 'OFF1');
  assert.equal(officeParams.limit, 100);
  assert.equal(officeParams.status, 'Active');

  const [agentParams] = calls[1].args;
  assert.equal(agentParams.agent, 'AGT1');
  assert.equal(agentParams.limit, 100);
});

test('getOfficeListings and getAgentListings reject without an id', async () => {
  const { methods } = createStub();

  await assert.rejects(() => methods.getOfficeListings(), /Office ID is required/);
  await assert.rejects(() => methods.getAgentListings(), /Agent ID is required/);
});
