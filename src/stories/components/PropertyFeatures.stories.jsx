import { PropertyFeatures } from '../../react/components/PropertyFeatures';
import { mockProperty, mockPropertyMinimal } from '../fixtures/properties';

export default {
  title: 'Components/PropertyFeatures',
  component: PropertyFeatures,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Interior, exterior/building, and school feature tables. Each row is skipped when its ' +
          'value is empty, so sparse listings stay tidy — see the Minimal story, which renders nothing.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-3xl">
        <Story />
      </div>
    )
  ]
};

export const Default = {
  args: { property: mockProperty }
};

export const Minimal = {
  args: { property: mockPropertyMinimal }
};
