import { formatArea, formatNumber, formatDate, getBathCount, isEmpty } from '../../shared/utils';
import { BedIcon, BathIcon, RulerIcon, HomeIcon, CalendarIcon } from './icons';

/**
 * Render the headline detail block for a single listing.
 *
 * Shows the address and price header, an icon stat row (status, beds, baths,
 * sqft, type, year built), the public description, and listing metadata
 * (MLS number, listed/updated dates). Empty fields are skipped rather than
 * rendered blank.
 *
 * @param {Object} props
 * @param {Property} props.property - Normalized listing to display.
 * @param {string} [props.className] - Additional CSS classes appended to the container.
 */
export function PropertyDetails({ property, className = '' }) {
  const {
    id,
    status,
    priceFormatted,
    priceSqFt,
    address = {},
    features = {},
    details = {},
    dates = {}
  } = property || {};

  const beds = features.beds ?? 0;
  const baths = getBathCount(features.baths);
  const sqft = Number(features.sqft) || 0;
  const locality = [address.city, address.state, address.zip].filter(Boolean).join(', ');

  const stats = [];
  if (!isEmpty(status)) {
    stats.push({
      key: 'status',
      lead: <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />,
      text: status
    });
  }
  if (!isEmpty(beds)) stats.push({ key: 'beds', lead: <BedIcon className="h-5 w-5" />, text: `${formatNumber(beds)} Beds` });
  if (!isEmpty(baths)) stats.push({ key: 'baths', lead: <BathIcon className="h-5 w-5" />, text: `${formatNumber(baths)} Baths` });
  if (!isEmpty(sqft)) stats.push({ key: 'sqft', lead: <RulerIcon className="h-5 w-5" />, text: formatArea(sqft) });
  if (!isEmpty(details.type)) stats.push({ key: 'type', lead: <HomeIcon className="h-5 w-5" />, text: details.type });
  if (!isEmpty(features.yearBuilt)) {
    stats.push({ key: 'year', lead: <CalendarIcon className="h-5 w-5" />, text: `Built ${features.yearBuilt}` });
  }

  const meta = [];
  if (!isEmpty(id)) meta.push({ key: 'mls', label: 'MLS® ID', value: id });
  if (!isEmpty(formatDate(dates.listed))) meta.push({ key: 'listed', label: 'Listed', value: formatDate(dates.listed) });
  if (!isEmpty(formatDate(dates.modified))) {
    meta.push({ key: 'updated', label: 'Updated', value: formatDate(dates.modified) });
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-gray-900">{address.street || 'Property'}</h2>
          {locality ? <p className="mt-1 text-gray-500">{locality}</p> : null}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{priceFormatted || '—'}</div>
          {!isEmpty(priceSqFt) ? <div className="text-sm text-gray-500">{priceSqFt} per sqft</div> : null}
        </div>
      </div>

      {stats.length ? (
        <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-4 sm:grid-cols-3 md:grid-cols-6">
          {stats.map((stat) => (
            <div key={stat.key} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="flex h-5 w-5 items-center justify-center text-gray-500">{stat.lead}</span>
              <span>{stat.text}</span>
            </div>
          ))}
        </div>
      ) : null}

      {!isEmpty(details.description) ? (
        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Description</h3>
          <p className="max-w-3xl whitespace-pre-line text-gray-700">{details.description}</p>
        </div>
      ) : null}

      {meta.length ? (
        <dl className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-3">
          {meta.map((item) => (
            <div key={item.key}>
              <dt className="text-xs uppercase tracking-wide text-gray-400">{item.label}</dt>
              <dd className="mt-0.5 font-medium text-gray-900">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
