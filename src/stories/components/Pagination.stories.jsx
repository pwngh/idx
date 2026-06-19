import { fn } from '@storybook/test';
import { Pagination } from '../../react/components/Pagination';

export default {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A results summary plus page navigation. Calls `onPageChange` with the requested page; ' +
          'the parent owns the data fetch.'
      }
    }
  },
  args: {
    onPageChange: fn(),
    recordsPerPage: 24
  },
  argTypes: {
    currentPage: { control: { type: 'number', min: 1 } },
    totalRecords: { control: { type: 'number', min: 0 } },
    recordsPerPage: { control: { type: 'number', min: 1 } },
    siblingsCount: { control: { type: 'number', min: 0, max: 3 } }
  }
};

export const FirstPage = {
  args: { currentPage: 1, totalRecords: 480 }
};

export const MiddlePage = {
  args: { currentPage: 8, totalRecords: 480 }
};

export const LastPage = {
  args: { currentPage: 20, totalRecords: 480 }
};

export const FewPages = {
  args: { currentPage: 1, totalRecords: 60 }
};

export const ZeroResults = {
  args: { currentPage: 1, totalRecords: 0 }
};
