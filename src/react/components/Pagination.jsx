import { ChevronLeftIcon, ChevronRightIcon } from './icons';

const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

/**
 * Build the page-button sequence with leading/trailing pages and ellipses.
 *
 * @param {number} currentPage
 * @param {number} totalPages
 * @param {number} siblingsCount - Pages shown on each side of the current page.
 * @returns {Array<number|'dots'>}
 */
function getPaginationRange(currentPage, totalPages, siblingsCount) {
  const totalNumbers = siblingsCount * 2 + 5;
  if (totalPages <= totalNumbers) return range(1, totalPages);

  const leftSibling = Math.max(currentPage - siblingsCount, 1);
  const rightSibling = Math.min(currentPage + siblingsCount, totalPages);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;
  const edgeCount = 3 + 2 * siblingsCount;

  if (!showLeftDots && showRightDots) return [...range(1, edgeCount), 'dots', totalPages];
  if (showLeftDots && !showRightDots) return [1, 'dots', ...range(totalPages - edgeCount + 1, totalPages)];
  return [1, 'dots', ...range(leftSibling, rightSibling), 'dots', totalPages];
}

const navBtn =
  'inline-flex items-center justify-center rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40';

/**
 * Render a results summary and page navigation for a paginated list.
 *
 * Calls `onPageChange` with the next 1-based page number; the parent owns the
 * actual data fetch. Scrolls to the top of the window on page change.
 *
 * @param {Object} props
 * @param {number} [props.currentPage=1] - Active 1-based page.
 * @param {number} [props.totalRecords=0] - Total number of records across all pages.
 * @param {number} [props.recordsPerPage=20] - Page size.
 * @param {(page: number) => void} [props.onPageChange] - Called with the requested page.
 * @param {number} [props.siblingsCount=1] - Page buttons shown on each side of the current page.
 * @param {string} [props.className] - Additional CSS classes appended to the container.
 */
export function Pagination({
  currentPage = 1,
  totalRecords = 0,
  recordsPerPage = 20,
  onPageChange,
  siblingsCount = 1,
  className = ''
}) {
  const totalPages = Math.max(1, Math.ceil(totalRecords / recordsPerPage));
  const page = Math.min(Math.max(1, currentPage), totalPages);

  const goTo = (next) => {
    const target = Math.min(Math.max(1, next), totalPages);
    if (target === page) return;
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    onPageChange?.(target);
  };

  const start = totalRecords === 0 ? 0 : (page - 1) * recordsPerPage + 1;
  const end = Math.min(page * recordsPerPage, totalRecords);
  const items = getPaginationRange(page, totalPages, siblingsCount);

  return (
    <nav aria-label="Pagination" className={`flex flex-col items-center gap-3 ${className}`}>
      <p className="text-sm text-gray-500">
        {totalRecords === 0
          ? 'No results'
          : `${start.toLocaleString()}–${end.toLocaleString()} of ${totalRecords.toLocaleString()} results`}
      </p>

      {totalRecords > 0 ? (
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => goTo(page - 1)} disabled={page <= 1} aria-label="Previous page" className={navBtn}>
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          {items.map((item, i) =>
            item === 'dots' ? (
              <span key={`dots-${i}`} className="px-2 text-gray-400" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => goTo(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
                className={`min-w-9 rounded-md px-3 py-1.5 text-sm transition-colors ${
                  item === page ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item}
              </button>
            )
          )}

          <button type="button" onClick={() => goTo(page + 1)} disabled={page >= totalPages} aria-label="Next page" className={navBtn}>
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </nav>
  );
}
