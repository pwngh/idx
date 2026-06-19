import { getBathCount, isEmpty } from '../../shared/utils';

/** Join an array into a comma-separated string; pass scalars through unchanged. */
function list(value) {
  return Array.isArray(value) ? value.join(', ') : value;
}

/** Render a yes/no string from a nullable boolean flag; '' when the flag is unknown. */
function yesNo(flag) {
  if (flag === null || flag === undefined) return '';
  return flag ? 'Yes' : 'No';
}

function FeatureTable({ title, rows }) {
  const visible = rows.filter((row) => !isEmpty(row.value));
  if (!visible.length) return null;

  return (
    <section>
      <h3 className="mb-3 text-lg font-semibold text-gray-900">{title}</h3>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {visible.map((row) => (
            <tr key={row.label} className="border-b border-gray-100 last:border-0">
              <td className="w-48 py-2 pr-4 align-top text-gray-500">{row.label}</td>
              <td className="py-2 align-top font-medium text-gray-900">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/**
 * Render the interior, exterior, and school feature tables for a listing.
 *
 * Each row is skipped when its value is empty, so listings with sparse data
 * stay tidy. Array values are joined with commas; boolean flags render as
 * Yes/No.
 *
 * @param {Object} props
 * @param {Property} props.property - Normalized listing to display.
 * @param {string} [props.className] - Additional CSS classes appended to the container.
 */
export function PropertyFeatures({ property, className = '' }) {
  const { features = {}, school = {} } = property || {};

  const interior = [
    { label: 'Total Stories', value: features.stories },
    { label: 'Bedrooms', value: features.beds },
    { label: 'Total Baths', value: getBathCount(features.baths) },
    { label: 'Full Baths', value: features.baths?.full },
    { label: 'Half Baths', value: features.baths?.half },
    { label: 'Interior Features', value: list(features.interior) },
    { label: 'Appliances', value: list(features.appliances) },
    { label: 'Laundry', value: list(features.laundry) },
    { label: 'Flooring', value: list(features.floor) },
    { label: 'Fireplace', value: yesNo(features.fireplace?.flag) },
    { label: 'Fireplace Details', value: list(features.fireplace?.description) },
    { label: 'Cooling', value: yesNo(features.cooling?.flag) },
    { label: 'Cooling Details', value: list(features.cooling?.description) },
    { label: 'Heating', value: yesNo(features.heating?.flag) },
    { label: 'Heating Details', value: list(features.heating?.description) }
  ];

  const exterior = [
    { label: 'Lot Size', value: features.lot?.size },
    { label: 'Lot Features', value: list(features.lot?.description) },
    { label: 'Architectural Style', value: list(features.architecturalStyle) },
    { label: 'Roof', value: list(features.roof) },
    { label: 'Sewer', value: list(features.sewer) },
    { label: 'Year Built', value: features.yearBuilt },
    { label: 'Garage Spaces', value: features.garage?.spaces },
    { label: 'Parking Spaces', value: features.parking?.spaces }
  ];

  const schools = [
    { label: 'School District', value: school.district },
    { label: 'High School', value: school.high },
    { label: 'Middle School', value: school.middle },
    { label: 'Elementary School', value: school.elementary }
  ];

  return (
    <div className={`space-y-8 ${className}`}>
      <FeatureTable title="Interior Features" rows={interior} />
      <FeatureTable title="Exterior / Building Features" rows={exterior} />
      <FeatureTable title="School Information" rows={schools} />
    </div>
  );
}
