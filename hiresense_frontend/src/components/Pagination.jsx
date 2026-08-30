export default function Pagination({ page, totalPages, onPageChange, isDark }) {
  const buttonClass = isDark ? 'rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50' : 'rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50';

  if (!totalPages || totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className={buttonClass}>Previous</button>
      <div className="flex items-center gap-2">
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={pageNumber === page ? (isDark ? 'rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900' : 'rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white') : buttonClass}
          >
            {pageNumber}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className={buttonClass}>Next</button>
    </div>
  );
}
