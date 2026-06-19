import React from 'react';
import { PropertyMap } from '../../react/components/PropertyMap';
import dotenv from 'dotenv';
import { fn } from '@storybook/test';

const onMarkerClick = fn();

dotenv.config()

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const streets = ['Main St', 'Oak Ave', 'Market St', 'Broadway', 'Washington Ave', 'Park Rd', 'Lake Dr', 'Forest Ln'];
const cities = ['Houston', 'Katy', 'Sugar Land', 'Pearland', 'The Woodlands'];

const generateProperty = (id, lat, lng, priceBase = 500000) => ({
  id: id.toString(),
  status: 'Active',
  price: Math.round((priceBase + Math.random() * 1000000) / 10000) * 10000, // Round to nearest 10k
  address: {
    street: `${Math.floor(Math.random() * 9999) + 1} ${streets[Math.floor(Math.random() * streets.length)]}`,
    city: cities[Math.floor(Math.random() * cities.length)],
    state: 'TX',
    zip: '77001'
  },
  features: {
    beds: Math.floor(Math.random() * 3) + 2,
    baths: Math.floor(Math.random() * 2) + 2,
    sqft: Math.floor(Math.random() * 2000) + 1500,
    yearBuilt: Math.floor(Math.random() * 40) + 1980
  },
  photos: [
    {
      url: '/api/placeholder/400/300',
      caption: 'Front view',
      order: 1
    }
  ],
  geo: {
    lat: lat + (Math.random() - 0.5) * 0.002, // Small random offset
    lng: lng + (Math.random() - 0.5) * 0.002
  }
});

const houstonCenter = { lat: 29.7604, lng: -95.3698 };

const downtownProperties = Array.from({ length: 15 }, (_, i) =>
  generateProperty(`downtown-${i}`, houstonCenter.lat, houstonCenter.lng, 800000)
);

const suburbanProperties = [
  // woodlands
  ...Array.from({ length: 5 }, (_, i) =>
    generateProperty(`woodlands-${i}`, 30.1588, -95.4889, 600000)
  ),
  // sugarland
  ...Array.from({ length: 8 }, (_, i) =>
    generateProperty(`sugarland-${i}`, 29.6197, -95.6349, 550000)
  ),
  // katy
  ...Array.from({ length: 6 }, (_, i) =>
    generateProperty(`katy-${i}`, 29.7858, -95.8245, 450000)
  ),
  // scattered
  generateProperty('pearland-1', 29.5635, -95.2860, 420000),
  generateProperty('clearlake-1', 29.5857, -95.1191, 380000),
  generateProperty('spring-1', 30.0799, -95.4173, 470000)
];

const mockProperties = [...downtownProperties, ...suburbanProperties];

export default {
  title: 'Components/PropertyMap',
  component: PropertyMap,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A map component for displaying property listings with markers and density-based display.

### Features
- Interactive map with property markers
- Density-based display (price labels vs dots)
- Custom info windows on marker click
- Mouse wheel zoom support
- Mobile-optimized controls
- Custom map styling
`
      }
    }
  }
};

export const Default = {
  render: () => (
    <PropertyMap
      apiKey={GOOGLE_MAPS_API_KEY}
      properties={mockProperties}
      center={houstonCenter}
      zoom={11}
      onMarkerClick={onMarkerClick}
    />
  )
};

export const DenseUrbanArea = {
  render: () => (
    <PropertyMap
      apiKey={GOOGLE_MAPS_API_KEY}
      properties={downtownProperties}
      center={houstonCenter}
      zoom={14}
      onMarkerClick={onMarkerClick}
    />
  )
};

export const SuburbanSpread = {
  render: () => (
    <PropertyMap
      apiKey={GOOGLE_MAPS_API_KEY}
      properties={suburbanProperties}
      center={{ lat: 29.8174, lng: -95.6599 }}
      zoom={11}
      onMarkerClick={onMarkerClick}
    />
  )
};

export const CustomHeightMap = {
  render: () => (
    <div className="container mx-auto p-4">
      <PropertyMap
        apiKey={GOOGLE_MAPS_API_KEY}
        properties={mockProperties}
        center={houstonCenter}
        zoom={11}
        className="h-[800px] rounded-xl shadow-lg"
        onMarkerClick={onMarkerClick}
      />
    </div>
  )
};

export const MobileView = {
  render: () => (
    <div className="w-full h-[667px]">
      <PropertyMap
        apiKey={GOOGLE_MAPS_API_KEY}
        properties={mockProperties}
        center={houstonCenter}
        zoom={11}
        className="h-full"
        onMarkerClick={onMarkerClick}
      />
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
};

// Error and loading states
export const LoadingState = {
  render: () => (
    <PropertyMap
      apiKey={GOOGLE_MAPS_API_KEY}
      properties={mockProperties}
      center={houstonCenter}
      zoom={11}
      isLoading={true}
    />
  )
};

export const ErrorState = {
  render: () => (
    <PropertyMap
      apiKey="invalid-key"
      properties={mockProperties}
      center={houstonCenter}
      zoom={11}
    />
  )
};
