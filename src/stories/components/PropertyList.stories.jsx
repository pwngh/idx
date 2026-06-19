import { fn } from '@storybook/test';
import { PropertyList } from '../../react/components/PropertyList';
import { withRemixMocks } from '../../../.storybook/mocks/remix';
import { mockProperties, manyProperties } from '../fixtures/properties';

export default {
  title: 'Components/PropertyList',
  component: PropertyList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A responsive grid of `PropertyCard`s with an optional header row (results count + ' +
          'custom slots), a skeleton loading state, and an empty state.'
      }
    }
  },
  args: {
    onPropertyClick: fn()
  },
  decorators: [withRemixMocks({})]
};

export const Default = {
  args: { properties: mockProperties }
};

export const WithHeader = {
  args: {
    properties: mockProperties,
    header: <span className="text-gray-500">Listings near Houston, TX</span>
  }
};

export const AsLinks = {
  args: {
    properties: mockProperties,
    getHref: (property) => `/properties/${property.id}`
  }
};

export const SingleItem = {
  args: { properties: mockProperties.slice(0, 1) }
};

export const ManyItems = {
  args: { properties: manyProperties }
};

export const Loading = {
  args: { properties: [], isLoading: true }
};

export const Empty = {
  args: { properties: [], emptyMessage: 'No properties match your search' }
};
