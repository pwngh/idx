import { fn } from '@storybook/test';
import { useState } from 'react';
import { PropertyCard } from '../../react/components/PropertyCard';
import {
  mockProperty,
  mockPropertyNoPhoto,
  mockPropertySold,
  mockPropertyPending,
  mockPropertyLongAddress
} from '../fixtures/properties';

export default {
  title: 'Components/PropertyCard',
  component: PropertyCard,
  parameters: {
    docs: {
      description: {
        component:
          'A summary card for a single listing: photo (or placeholder), status badge, ' +
          'optional favorite toggle, price, a compact beds/baths/sqft line, and the MLS number. ' +
          'Pass `onClick` for a click handler or `href` to render the card as a link.'
      }
    }
  },
  args: {
    onClick: fn()
  },
  argTypes: {
    property: { control: 'object' },
    href: { control: 'text' },
    isFavorite: { control: 'boolean' },
    showStatusBadge: { control: 'boolean' },
    showMlsNumber: { control: 'boolean' }
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    )
  ]
};

export const Default = {
  args: { property: mockProperty }
};

export const NoPhoto = {
  args: { property: mockPropertyNoPhoto }
};

export const Sold = {
  args: { property: mockPropertySold }
};

export const Pending = {
  args: { property: mockPropertyPending }
};

export const LongAddress = {
  args: { property: mockPropertyLongAddress }
};

export const AsLink = {
  args: { property: mockProperty, href: `/properties/${mockProperty.id}` }
};

export const ReadOnly = {
  args: { property: mockProperty, onClick: undefined }
};

const FavoriteDemo = (args) => {
  const [favorite, setFavorite] = useState(false);
  return <PropertyCard {...args} isFavorite={favorite} onFavoriteChange={setFavorite} />;
};

export const WithFavorite = {
  render: (args) => <FavoriteDemo {...args} />,
  args: { property: mockProperty }
};
