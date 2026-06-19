import { formatPrice, formatNumber, getBathCount } from '../../shared/utils';
import { HeartIcon, PhotoPlaceholder } from './icons';

/**
 * Render a single property listing as a summary card.
 *
 * Shows the primary photo (or a placeholder), status badge, optional favorite
 * toggle, price, address, a compact beds/baths/sqft line, and the MLS number.
 * The card navigates via `href` when provided, otherwise the whole card is a
 * click target that calls `onClick`.
 *
 * @param {Object} props
 * @param {Property} props.property - Normalized listing to display.
 * @param {(property: Property) => void} [props.onClick] - Called with the listing when the card is clicked (ignored when `href` is set).
 * @param {string} [props.href] - When set, the card renders as a link to this URL.
 * @param {boolean} [props.isFavorite] - Controls the favorite heart; omit to hide the heart entirely.
 * @param {(next: boolean) => void} [props.onFavoriteChange] - Called with the next favorite state when the heart is toggled.
 * @param {boolean} [props.showStatusBadge=true] - Show the listing-status badge over the photo.
 * @param {boolean} [props.showMlsNumber=true] - Show the MLS number over the photo.
 * @param {string} [props.className] - Additional CSS classes appended to the card container.
 */
export function PropertyCard({
  property,
  onClick,
  href,
  isFavorite,
  onFavoriteChange,
  showStatusBadge = true,
  showMlsNumber = true,
  className = ''
}) {
  const { id, status, price, priceFormatted, photos = [], address = {}, features = {} } = property || {};

  const mainPhoto = photos[0]?.url;
  const beds = features.beds ?? 0;
  const baths = getBathCount(features.baths);
  const sqft = Number(features.sqft) || 0;
  const locality = [address.city, address.state, address.zip].filter(Boolean).join(', ');
  const showFavorite = isFavorite !== undefined;
  const interactive = Boolean(onClick) && !href;

  const handleFavorite = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onFavoriteChange?.(!isFavorite);
  };

  const media = (
    <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg bg-gray-100">
      {mainPhoto ? (
        <img
          src={mainPhoto}
          alt={address.street || 'Property photo'}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <PhotoPlaceholder className="h-full w-full" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20" />

      {showStatusBadge && status ? (
        <span className="absolute left-3 top-3 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {status}
        </span>
      ) : null}

      {showFavorite ? (
        <button
          type="button"
          onClick={handleFavorite}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <HeartIcon filled={isFavorite} className={`h-4 w-4 ${isFavorite ? 'text-rose-500' : 'text-white'}`} />
        </button>
      ) : null}

      {showMlsNumber && id ? (
        <span className="absolute bottom-3 left-3 rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-gray-700 backdrop-blur-sm">
          MLS# {id}
        </span>
      ) : null}
    </div>
  );

  const body = (
    <div className="p-4">
      <div className="text-lg font-semibold text-gray-900">{priceFormatted || formatPrice(price)}</div>

      <p className="mt-1 text-sm text-gray-500">
        {formatNumber(beds)}bd &bull; {formatNumber(baths)}ba &bull; {sqft.toLocaleString()} sqft
      </p>

      <h3 className="mt-2 truncate font-medium text-gray-900">{address.street || 'Property'}</h3>
      {locality ? <p className="mt-0.5 truncate text-sm text-gray-600">{locality}</p> : null}
    </div>
  );

  const cardClass = `group relative block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${
    interactive ? 'cursor-pointer' : ''
  } ${className}`.trim();

  if (href) {
    return (
      <div className={cardClass}>
        <a href={href} className="block">
          {media}
          {body}
        </a>
      </div>
    );
  }

  return (
    <div
      className={cardClass}
      onClick={interactive ? () => onClick?.(property) : undefined}
      role={interactive ? 'button' : undefined}
      aria-label={interactive ? `View property at ${address.street || 'this listing'}` : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.(property);
              }
            }
          : undefined
      }
    >
      {media}
      {body}
    </div>
  );
}
