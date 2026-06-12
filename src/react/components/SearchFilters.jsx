import { Form, useNavigation, useSearchParams } from '@remix-run/react';
import {
  PROPERTY_TYPES,
  PROPERTY_STATUS,
  SORT_OPTIONS
} from '../../shared/constants';

/**
 * Render a property search form that submits filters as URL query params.
 *
 * Submits via GET to `searchPath` with the params minPrice, maxPrice, beds,
 * baths, propertyType, status, and sort, so the consuming route's loader can
 * read them directly. Current selections are rehydrated from the URL on render.
 *
 * @param {Object} props
 * @param {string} props.searchPath - Remix route the form submits to.
 * @param {boolean} [props.includeStatus=false] - Show the listing-status filter.
 * @param {boolean} [props.autoSubmit=true] - Submit on every field change; when false, an explicit Search button is rendered instead.
 * @param {string} [props.className] - Additional CSS classes appended to the form.
 */
export function SearchFilters({
  searchPath,
  includeStatus = false,
  autoSubmit = true,
  className = ''
}) {
  const navigation = useNavigation();
  const [params] = useSearchParams();
  const isSearching = navigation.state === 'submitting';

  return (
    <Form
      method="get"
      action={searchPath}
      className={`space-y-4 ${className}`}
      onChange={e => autoSubmit && e.target.form.submit()}
    >
      {/* Price Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Min Price
          </label>
          <select
            name="minPrice"
            defaultValue={params.get('minPrice') || ''}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="">No Min</option>
            {[100000, 200000, 300000, 400000, 500000, 750000, 1000000]
              .map(price => (
                <option key={price} value={price}>
                  ${price.toLocaleString()}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Max Price
          </label>
          <select
            name="maxPrice"
            defaultValue={params.get('maxPrice') || ''}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="">No Max</option>
            {[200000, 300000, 400000, 500000, 750000, 1000000, 1500000, 2000000]
              .map(price => (
                <option key={price} value={price}>
                  ${price.toLocaleString()}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Beds & Baths */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Beds
          </label>
          <select
            name="beds"
            defaultValue={params.get('beds') || ''}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>
                {num}+ beds
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Baths
          </label>
          <select
            name="baths"
            defaultValue={params.get('baths') || ''}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="">Any</option>
            {[1, 1.5, 2, 2.5, 3, 3.5, 4].map(num => (
              <option key={num} value={num}>
                {num}+ baths
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Property Type & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Property Type
          </label>
          <select
            name="propertyType"
            defaultValue={params.get('propertyType') || ''}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {Object.entries(PROPERTY_TYPES).map(([key, value]) => (
              <option key={key} value={value}>
                {key.split('_').map(word =>
                  word.charAt(0) + word.slice(1).toLowerCase()
                ).join(' ')}
              </option>
            ))}
          </select>
        </div>
        {includeStatus && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              defaultValue={params.get('status') || PROPERTY_STATUS.ACTIVE}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              {Object.entries(PROPERTY_STATUS).map(([key, value]) => (
                <option key={key} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Sort By
        </label>
        <select
          name="sort"
          defaultValue={`${params.get('sortBy')}-${params.get('order')}`}
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          {Object.entries(SORT_OPTIONS).map(([key, { field, order }]) => (
            <option key={key} value={`${field}-${order}`}>
              {key.split('_')
                .map(word => word.charAt(0) + word.slice(1).toLowerCase())
                .join(' ')}
            </option>
          ))}
        </select>
      </div>

      {!autoSubmit && (
        <button
          type="submit"
          disabled={isSearching}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      )}
    </Form>
  );
}
