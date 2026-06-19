import { Form, useNavigation, useSearchParams } from '@remix-run/react';
import { useEffect, useMemo, useRef } from 'react';
import { PROPERTY_TYPES, PROPERTY_STATUS, SORT_OPTIONS } from '../../shared/constants';

const MIN_PRICES = [100000, 200000, 300000, 400000, 500000, 750000, 1000000];
const MAX_PRICES = [200000, 300000, 400000, 500000, 750000, 1000000, 1500000, 2000000];

const SORT_LABELS = {
  PRICE_ASC: 'Price (Low to High)',
  PRICE_DESC: 'Price (High to Low)',
  DATE_ASC: 'Oldest',
  DATE_DESC: 'Newest',
  BEDS_ASC: 'Beds (Fewest)',
  BEDS_DESC: 'Beds (Most)',
  SQFT_ASC: 'Sqft (Smallest)',
  SQFT_DESC: 'Sqft (Largest)'
};

const selectClass =
  'mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
const labelClass = 'block text-sm font-medium text-gray-700';

/** Title-case an UPPER_SNAKE constant key, e.g. SINGLE_FAMILY -> 'Single Family'. */
function humanize(key) {
  return key
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Render a property search form that submits filters as URL query params.
 *
 * Submits via GET to `searchPath` with the params minPrice, maxPrice, beds,
 * baths, propertyType, status, sortBy, and order, so the consuming route's loader
 * can read them with `parseSearchParams`. Current selections are rehydrated from
 * the URL on render.
 *
 * @param {Object} props
 * @param {string} props.searchPath - Remix route the form submits to.
 * @param {boolean} [props.includeStatus=false] - Show the listing-status filter.
 * @param {boolean} [props.autoSubmit=true] - Submit on every field change; when false, an explicit Search button is rendered instead.
 * @param {boolean} [props.showReset=false] - Render a Clear control that resets all filters.
 * @param {string} [props.className] - Additional CSS classes appended to the form.
 */
export function SearchFilters({
  searchPath,
  includeStatus = false,
  autoSubmit = true,
  showReset = false,
  className = ''
}) {
  const navigation = useNavigation();
  const [params] = useSearchParams();
  const isSearching = navigation.state === 'submitting' || navigation.state === 'loading';

  const sortFieldRef = useRef(null);
  const orderRef = useRef(null);

  // Sort is one visible select but two submitted params (field + direction),
  // since several sort presets share a field (e.g. price asc/desc). The visible
  // select carries `field|order`; on change we mirror it into the hidden inputs
  // that actually submit. The select's onChange fires before the form's
  // auto-submit handler (event bubbling), so the hidden inputs are current when
  // the form submits.
  const sortParam = params.get('sortBy');
  const orderParam = params.get('order');
  const currentSortValue = useMemo(() => {
    const match = Object.values(SORT_OPTIONS).find((s) => s.field === sortParam && s.order === orderParam);
    const chosen = match || SORT_OPTIONS.DATE_DESC;
    return `${chosen.field}|${chosen.order}`;
  }, [sortParam, orderParam]);
  const [defaultSortField, defaultSortOrder] = currentSortValue.split('|');

  // The hidden inputs are uncontrolled, so `defaultValue` only applies at mount.
  // Re-sync them whenever the URL-derived sort changes (e.g. after Clear) so a
  // submit triggered by another field can't carry a stale sort/order.
  useEffect(() => {
    if (sortFieldRef.current) sortFieldRef.current.value = defaultSortField;
    if (orderRef.current) orderRef.current.value = defaultSortOrder;
  }, [defaultSortField, defaultSortOrder]);

  const handleSortChange = (event) => {
    const [field, order] = event.target.value.split('|');
    if (sortFieldRef.current) sortFieldRef.current.value = field;
    if (orderRef.current) orderRef.current.value = order;
  };

  return (
    <Form
      method="get"
      action={searchPath}
      className={`space-y-4 ${className}`}
      onChange={(event) => autoSubmit && event.currentTarget.submit()}
    >
      <fieldset className="grid grid-cols-2 gap-4 border-0 p-0">
        <legend className="sr-only">Price range</legend>
        <div>
          <label htmlFor="filter-minPrice" className={labelClass}>
            Min Price
          </label>
          <select
            id="filter-minPrice"
            name="minPrice"
            defaultValue={params.get('minPrice') || ''}
            className={selectClass}
          >
            <option value="">No Min</option>
            {MIN_PRICES.map((price) => (
              <option key={price} value={price}>
                ${price.toLocaleString()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-maxPrice" className={labelClass}>
            Max Price
          </label>
          <select
            id="filter-maxPrice"
            name="maxPrice"
            defaultValue={params.get('maxPrice') || ''}
            className={selectClass}
          >
            <option value="">No Max</option>
            {MAX_PRICES.map((price) => (
              <option key={price} value={price}>
                ${price.toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-2 gap-4 border-0 p-0">
        <legend className="sr-only">Beds and baths</legend>
        <div>
          <label htmlFor="filter-beds" className={labelClass}>
            Beds
          </label>
          <select id="filter-beds" name="beds" defaultValue={params.get('beds') || ''} className={selectClass}>
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num}+ beds
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-baths" className={labelClass}>
            Baths
          </label>
          <select id="filter-baths" name="baths" defaultValue={params.get('baths') || ''} className={selectClass}>
            <option value="">Any</option>
            {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((num) => (
              <option key={num} value={num}>
                {num}+ baths
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-2 gap-4 border-0 p-0">
        <legend className="sr-only">Property type and status</legend>
        <div>
          <label htmlFor="filter-propertyType" className={labelClass}>
            Property Type
          </label>
          <select
            id="filter-propertyType"
            name="propertyType"
            defaultValue={params.get('propertyType') || ''}
            className={selectClass}
          >
            <option value="">All Types</option>
            {Object.entries(PROPERTY_TYPES).map(([key, value]) => (
              <option key={key} value={value}>
                {humanize(key)}
              </option>
            ))}
          </select>
        </div>
        {includeStatus ? (
          <div>
            <label htmlFor="filter-status" className={labelClass}>
              Status
            </label>
            <select
              id="filter-status"
              name="status"
              defaultValue={params.get('status') || PROPERTY_STATUS.ACTIVE}
              className={selectClass}
            >
              {Object.entries(PROPERTY_STATUS).map(([key, value]) => (
                <option key={key} value={value}>
                  {humanize(key)}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </fieldset>

      <div>
        <label htmlFor="filter-sort" className={labelClass}>
          Sort By
        </label>
        <select
          id="filter-sort"
          defaultValue={currentSortValue}
          onChange={handleSortChange}
          className={selectClass}
        >
          {Object.entries(SORT_OPTIONS).map(([key, { field, order }]) => (
            <option key={key} value={`${field}|${order}`}>
              {SORT_LABELS[key] || humanize(key)}
            </option>
          ))}
        </select>
        <input type="hidden" name="sortBy" ref={sortFieldRef} defaultValue={defaultSortField} />
        <input type="hidden" name="order" ref={orderRef} defaultValue={defaultSortOrder} />
      </div>

      {!autoSubmit || showReset ? (
        <div className="flex gap-3">
          {!autoSubmit ? (
            <button
              type="submit"
              disabled={isSearching}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          ) : null}
          {showReset ? (
            <a
              href={searchPath}
              className="rounded-md border border-gray-300 px-4 py-2 text-center text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Clear
            </a>
          ) : null}
        </div>
      ) : null}
    </Form>
  );
}
