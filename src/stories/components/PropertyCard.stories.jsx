import { fn } from '@storybook/test';
import { PropertyCard } from '../../react/components/PropertyCard';
import { withRemixMocks } from '../../../.storybook/mocks/remix';

const mockProperty = {
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
      url: 'https://example.com/photo1.jpg',
      caption: 'Front view',
      order: 1
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
};

export default {
  title: 'Components/PropertyCard',
  component: PropertyCard,
  parameters: {
    docs: {
      description: {
        component: `
A card component for displaying individual property listings.

### Features
- Responsive image with hover zoom effect
- Price badge overlay
- Property details including address and key features
- Hover shadow animation
- Click handling for navigation

### Usage
\`\`\`jsx
import { PropertyCard } from '@pwngh/idx/react';
import { fn } from '@storybook/test';

<PropertyCard 
  property={property}
  onClick={(property) => handlePropertyClick(property)}
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
    property: mockProperty,
    onClick: fn(),
  }
};

export const WithCustomClass = {
  decorators: [withRemixMocks({})],
  args: {
    property: mockProperty,
    className: 'max-w-sm',
    onClick: fn(),
  }
};

export const NoPhoto = {
  decorators: [withRemixMocks({})],
  args: {
    property: {
      ...mockProperty,
      photos: []
    },
    onClick: fn(),
  }
};

export const LongAddress = {
  decorators: [withRemixMocks({})],
  args: {
    property: {
      ...mockProperty,
      address: {
        street: '123 Really Long Street Name That Might Wrap',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105'
      }
    },
    onClick: fn(),
  }
};

export const HighPrice = {
  decorators: [withRemixMocks({})],
  args: {
    property: {
      ...mockProperty,
      price: 1250000
    },
    onClick: fn(),
  }
};

export const ReadOnly = {
  decorators: [withRemixMocks({})],
  args: {
    property: mockProperty,
    // No onClick handler provided
  }
};