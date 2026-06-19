import { useEffect, useState, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, PhotoPlaceholder } from './icons';

/**
 * Render a responsive photo gallery with a full-screen lightbox.
 *
 * Lays out a hero image plus a thumbnail grid on desktop and a single tappable
 * hero on mobile. Clicking any photo opens a lightbox that supports Escape to
 * close and arrow keys to page through. Handles 0, 1, or many photos. No
 * carousel dependency — pure React + CSS.
 *
 * @param {Object} props
 * @param {Array<Photo>} [props.photos=[]] - Normalized photos; ordered by `photo.order`.
 * @param {boolean} [props.showCaption=true] - Show each photo's short description in the lightbox.
 * @param {string} [props.className] - Additional CSS classes appended to the container.
 */
export function PropertyGallery({ photos = [], showCaption = true, className = '' }) {
  const sorted = [...photos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const count = sorted.length;

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const close = useCallback(() => setOpen(false), []);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const openAt = (i) => {
    setIndex(i);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowRight') next();
      else if (event.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close, next, prev]);

  if (count === 0) {
    return <PhotoPlaceholder className={`aspect-video w-full rounded-lg ${className}`} />;
  }

  // Clamp in case `photos` shrank while the lightbox was open.
  const activeIndex = Math.min(index, count - 1);
  const activePhoto = sorted[activeIndex];

  const thumbBtn = 'group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500';
  const thumbImg = 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105';

  return (
    <div className={className}>
      {/* Mobile: single tappable hero */}
      <button
        type="button"
        onClick={() => openAt(0)}
        aria-label={count > 1 ? `Open photo gallery (${count} photos)` : 'Open photo'}
        className={`${thumbBtn} block h-72 w-full rounded-lg md:hidden`}
      >
        <img src={sorted[0].url} alt={sorted[0].shortDescription || 'Property photo'} className={thumbImg} />
        {count > 1 ? (
          <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
            {count} photos
          </span>
        ) : null}
      </button>

      {/* Desktop: hero + thumbnail grid */}
      {count === 1 ? (
        <button type="button" onClick={() => openAt(0)} aria-label="Open photo" className={`${thumbBtn} hidden h-96 w-full rounded-lg md:block`}>
          <img src={sorted[0].url} alt={sorted[0].shortDescription || 'Property photo'} className={thumbImg} />
        </button>
      ) : (
        <div className="hidden h-96 grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-lg md:grid">
          <button type="button" onClick={() => openAt(0)} aria-label={`Open photo gallery (${count} photos)`} className={`${thumbBtn} col-span-2 row-span-2`}>
            <img src={sorted[0].url} alt={sorted[0].shortDescription || 'Property photo'} className={thumbImg} />
          </button>
          {sorted.slice(1, 5).map((photo, i) => (
            <button key={photo.mediaKey || i} type="button" onClick={() => openAt(i + 1)} aria-label={`View photo ${i + 2}`} className={thumbBtn}>
              <img src={photo.url} alt={photo.shortDescription || 'Property photo'} className={thumbImg} />
              {i === 3 && count > 5 ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                  +{count - 5}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close gallery"
            className="absolute right-4 top-4 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <CloseIcon className="h-6 w-6" />
          </button>

          {count > 1 ? (
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
          ) : null}

          <figure className="flex max-h-[85vh] max-w-[90vw] flex-col items-center">
            <img
              src={activePhoto.url}
              alt={activePhoto.shortDescription || 'Property photo'}
              className="max-h-[80vh] max-w-[90vw] object-contain"
            />
            {showCaption && activePhoto.shortDescription ? (
              <figcaption className="mt-3 text-center text-sm text-white/80">
                {activePhoto.shortDescription}
              </figcaption>
            ) : null}
          </figure>

          {count > 1 ? (
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          ) : null}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
            {activeIndex + 1} / {count}
          </div>
        </div>
      ) : null}
    </div>
  );
}
