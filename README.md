## @pwngh/idx

> IDX integration for Remix applications.

See [Bridge Web API](https://bridgedataoutput.com/docs/platform/API/bridge).

### Overview

This package provides a structured way to interact with IDX in both Node.js and React environments. 

Install from GitHub:

> npm install https://github.com/pwngh/idx.git

### Server-Side Features (<small>`@pwngh/idx/node`</small>)

- Fetch IDX listings
- Fetch IDX property details
- Create and update IDX listings
- Handle IDX-specific API calls

### Server-Side Usage

```javascript
import { createIDX } from '@pwngh/idx/node';

const { 
  getListings,
  getPropertyDetails,
  getNearbyListings,
  searchProperties,
  getOfficeListings,
  getAgentListings,
  client
} = createIDX({
  apiKey: process.env.IDX_API_KEY
});

// Fetch a list of properties
const listings = await getListings({
  minPrice: 300000,
  maxPrice: 500000,
  beds: 3,
  baths: 2,
  status: 'Active'
});

// Fetch details for a specific property
const propertyDetails = await getPropertyDetails('123456789');

// Find listings near a location
const nearbyListings = await getNearbyListings(37.7749, -122.4194, 5);

// Search for properties with filters
const filteredListings = await searchProperties({
  minPrice: 400000,
  maxPrice: 600000,
  propertyType: 'SingleFamilyResidence',
  status: 'Active',
  limit: 20,
  offset: 0
});

// Fetch listings for a specific office
const officeListings = await getOfficeListings('office-123', {
  status: 'Active',
  limit: 50
});

// Fetch listings for a specific agent
const agentListings = await getAgentListings('agent-456', {
  status: 'Active',
  limit: 25
});
```

### Client-Side Features (<small>`@pwngh/idx/react`</small>)

- IDX search and filtering components
- IDX property detail page components
- Custom hooks for managing IDX state
- Remix-specific integrations

### Client-Side Usage

```jsx
// app/routes/idx.jsx
import { useLoaderData } from '@remix-run/react';
import { createIDX } from '@pwngh/idx/node';
import { PropertyList, PropertyMap } from '@pwngh/idx/react';

export const loader = async () => {
  const { getListings } = createIDX({
    apiKey: process.env.IDX_API_KEY
  });

  // Fetch properties from the IDX API
  const properties = await getListings({
    minPrice: 300000,
    maxPrice: 500000,
    beds: 3,
    baths: 2,
    status: 'Active'
  });

  return { properties };
};

export default function IdxPage() {
  const { properties } = useLoaderData();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">IDX Search</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2">
          <PropertyList properties={properties} onPropertyClick={(property) => console.log(property)} />
        </div>
        <div>
          <PropertyMap
            apiKey={process.env.GOOGLE_MAPS_API_KEY}
            properties={properties}
            onMarkerClick={(property) => console.log(property)}
            center={{ lat: 37.7749, lng: -122.4194 }}
            zoom={12}
            showCluster
          />
        </div>
      </div>
    </div>
  );
}
```

### Error Handling

The package includes standardized error handling with specific error codes and user-friendly messages. 

All server methods return consistent error structures that can be easily handled on the client.

### Requirements

- Node.js >= 20.0.0
- Remix >= 2.13.1
- React >= 18.2.0
- @googlemaps/js-api-loader >= 1.16.2
- google-maps >= 4.3.3

### License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Preston Neal.