import { PropertyGallery } from '../../react/components/PropertyGallery';
import { galleryPhotos } from '../fixtures/properties';

export default {
  title: 'Components/PropertyGallery',
  component: PropertyGallery,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A responsive photo gallery: a hero plus thumbnail grid on desktop, a tappable hero on ' +
          'mobile, and a full-screen lightbox. Click any photo, then use the arrow keys or Escape.'
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
  args: { photos: galleryPhotos }
};

export const FivePhotos = {
  args: { photos: galleryPhotos.slice(0, 5) }
};

export const SinglePhoto = {
  args: { photos: galleryPhotos.slice(0, 1) }
};

export const NoPhotos = {
  args: { photos: [] }
};
