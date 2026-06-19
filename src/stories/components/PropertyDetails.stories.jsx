import { PropertyDetails } from '../../react/components/PropertyDetails';
import { mockProperty, mockPropertySold, mockPropertyMinimal } from '../fixtures/properties';

export default {
  title: 'Components/PropertyDetails',
  component: PropertyDetails,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The headline detail block for a listing: address + price header, an icon stat row, the ' +
          'public description, and listing metadata. Empty fields are skipped.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-4xl">
        <Story />
      </div>
    )
  ]
};

export const Default = {
  args: { property: mockProperty }
};

export const Sold = {
  args: { property: mockPropertySold }
};

export const Minimal = {
  args: { property: mockPropertyMinimal }
};
