import { resetRemixMocks } from './mocks/remix';
import './styles.css';

/** @type { import('@storybook/react').Preview } */
const preview = {
  // Generate a Docs page for every component automatically.
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
        boolean: /^(is|has|can|should|show)/
      }
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'gray', value: '#f3f4f6' },
        { name: 'dark', value: '#111827' }
      ]
    },
    options: {
      storySort: {
        order: ['Introduction', 'Components', 'Hooks']
      }
    },
    docs: {
      toc: true
    }
  },
  decorators: [
    (Story) => {
      resetRemixMocks();
      return <Story />;
    }
  ]
};

export default preview;
