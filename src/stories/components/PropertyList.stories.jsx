import { fn } from '@storybook/test';
import { PropertyList } from '../../react/components/PropertyList';
import { withRemixMocks } from '../../../.storybook/mocks/remix';

const mockProperties = [
  {
    id: '12345',
    status: 'Active',
    price: 350000,
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105'
    },
    features: {
      beds: 3,
      baths: 2,
      sqft: 1500,
      yearBuilt: 2010
    },
    photos: [
      {
        Uri: 'https://example.com/photo1.jpg',
        Caption: 'Front view',
        Order: 1
      }
    ],
    geo: {
      lat: 37.7749,
      lng: -122.4194
    },
    dates: {
      listed: new Date('2024-01-01'),
      modified: new Date('2024-01-15'),
      daysOnMarket: 30
    }
  },
  {
    id: '67890',
    status: 'Active',
    price: 425000,
    address: {
      street: '456 Oak Ave',
      city: 'San Francisco',
      state: 'CA',
      zip: '94110'
    },
    features: {
      beds: 4,
      baths: 2.5,
      sqft: 2000,
      yearBuilt: 2015
    },
    photos: [
      {
        Uri: 'https://example.com/photo2.jpg',
        Caption: 'Front view',
        Order: 1
      }
    ],
    geo: {
      lat: 37.7833,
      lng: -122.4167
    },
    dates: {
      listed: new Date('2024-01-15'),
      modified: new Date('2024-02-01'),
      daysOnMarket: 15
    }
  }
];

export default {
  title: 'Components/PropertyList',
  component: PropertyList,
  parameters: {
    docs: {
      description: {
        component: `
A responsive grid layout component for displaying property listings.

### Features
- Responsive grid layout (1 column on mobile, 2 on tablet, 3 on desktop)
- Loading state with skeleton placeholders
- Empty state with customizable message
- Click handling for each property card

### Usage
\`\`\`jsx
import { PropertyList } from '@pwngh/idx/react';
import { fn } from '@storybook/test';

<PropertyList 
  properties={properties}
  onPropertyClick={(property) => handlePropertyClick(property)}
/>
\`\`\`
        `
      }
    }
  }
};

export const Default = {
  decorators: [withRemixMocks({})],
  args: {
    properties: mockProperties,
    onPropertyClick: fn(),
  },
  parameters: {
    layout: 'padded' // Add this for better visibility
  }
};
export const Loading = {
  decorators: [withRemixMocks({})],
  args: {
    properties: [],
    showLoading: true,
  }
};

export const Empty = {
  decorators: [withRemixMocks({})],
  args: {
    properties: [],
    emptyMessage: 'No properties match your search'
  }
};