import { fn } from '@storybook/test';
import { AgentCard } from '../../react/components/AgentCard';
import { mockProperty } from '../fixtures/properties';

export default {
  title: 'Components/AgentCard',
  component: AgentCard,
  parameters: {
    docs: {
      description: {
        component:
          'A contact card for a listing agent. Accepts the normalized `listingAgent` shape; the ' +
          'email row renders only when an `email` is present. The Contact button calls `onContact`.'
      }
    }
  },
  args: {
    onContact: fn()
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
  args: { agent: mockProperty.listingAgent }
};

export const NoOffice = {
  args: { agent: { name: 'Jordan Rivera', phone: '(281) 555-0190', email: 'jordan@bayoucity.com' } }
};

export const NoContactInfo = {
  args: { agent: { name: 'Pat Lee', officeName: 'Bayou City Realty' } }
};

export const Unknown = {
  args: { agent: {} }
};
