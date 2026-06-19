import { getInitials } from '../../shared/utils';
import { PhoneIcon, MailIcon } from './icons';

/**
 * Render a contact card for a listing agent.
 *
 * Accepts the normalized `listingAgent` shape ({ name, officeName, phone, ... }).
 * The normalized record has no `email`, but one is rendered when present so a
 * consumer can attach it. The Contact button defers to `onContact`.
 *
 * @param {Object} props
 * @param {{name?: string, officeName?: string, phone?: string, email?: string}} props.agent - Agent record.
 * @param {(agent: Object) => void} [props.onContact] - Called with the agent when the Contact button is pressed.
 * @param {string} [props.className] - Additional CSS classes appended to the card.
 */
export function AgentCard({ agent, onContact, className = '' }) {
  const { name, officeName, phone, email } = agent || {};

  return (
    <div className={`max-w-sm rounded-lg border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white"
        >
          {getInitials(name)}
        </div>
        <div className="min-w-0">
          <div className="truncate font-semibold text-gray-900">{name || 'Unknown Agent'}</div>
          {officeName ? <div className="truncate text-sm text-gray-500">{officeName}</div> : null}
        </div>
      </div>

      {phone || email ? (
        <dl className="mt-4 space-y-2 text-sm">
          {phone ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-gray-500">
                <PhoneIcon className="h-4 w-4" /> Phone
              </dt>
              <dd>
                <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="font-medium text-gray-900 hover:underline">
                  {phone}
                </a>
              </dd>
            </div>
          ) : null}
          {email ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-gray-500">
                <MailIcon className="h-4 w-4" /> Email
              </dt>
              <dd className="min-w-0">
                <a href={`mailto:${email}`} className="block truncate font-medium text-gray-900 hover:underline">
                  {email}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <button
        type="button"
        onClick={() => onContact?.(agent)}
        className="mt-5 w-full rounded-md bg-gray-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-gray-800"
      >
        Contact Agent
      </button>
    </div>
  );
}
