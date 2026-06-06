'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  const getVisiblePages = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const delta = 1;

    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);

    if (rangeStart > 2) {
      pages.push('ellipsis');
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    if (rangeEnd < totalPages - 1) {
      pages.push('ellipsis');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const btnBase =
    'inline-flex items-center justify-center min-w-[36px] sm:min-w-[40px] h-9 sm:h-10 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500';
  const btnActive = 'bg-emerald-500 text-white hover:bg-emerald-600';
  const btnInactive =
    'text-gray-500 hover:text-gray-700 hover:bg-gray-100';
  const btnDisabled = 'text-gray-300 cursor-not-allowed';

  return (
    <div className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Info — oculto en mobile muy pequeño */}
      <p className="hidden xs:block sm:text-sm text-xs text-gray-500">
        Mostrando <span className="font-medium">{from}</span>–<span className="font-medium">{to}</span> de{' '}
        <span className="font-medium">{totalItems}</span> reportes
      </p>

      {/* Page navigation */}
      <div className="flex items-center gap-1 mx-auto sm:mx-0">
        {/* First */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnInactive}`}
          aria-label="Primera página"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnInactive}`}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {getVisiblePages().map((page, idx) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 select-none">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`${btnBase} ${page === currentPage ? btnActive : btnInactive}`}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Mobile: show current page / total */}
        <span className="sm:hidden px-3 text-sm text-gray-500 font-medium">
          {currentPage} / {totalPages}
        </span>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnInactive}`}
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnInactive}`}
          aria-label="Última página"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
