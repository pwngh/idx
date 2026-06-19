import { SearchFilters } from '../../react/components/SearchFilters';
import { withRemixMocks } from '../../../.storybook/mocks/remix';

export default {
  title: 'Components/SearchFilters',
  component: SearchFilters,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A Remix `<Form>` that submits search filters as URL query params (minPrice, maxPrice, ' +
          'beds, baths, propertyType, status, sortBy, order) for the route loader to read with ' +
          '`parseSearchParams`. Inside Storybook the submit is a no-op navigation within the stub.'
      }
    }
  },
  args: {
    searchPath: '/search',
    includeStatus: false,
    autoSubmit: true,
    showReset: false
  },
  argTypes: {
    includeStatus: { control: 'boolean' },
    autoSubmit: { control: 'boolean' },
    showReset: { control: 'boolean' }
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
    withRemixMocks({})
  ]
};

export const Default = {};

export const WithStatus = {
  args: { includeStatus: true }
};

export const ManualSubmit = {
  args: { autoSubmit: false }
};

export const WithReset = {
  args: { autoSubmit: false, showReset: true }
};
