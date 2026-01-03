import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
  showSummary?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
  className,
  showSummary = true,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

  if (totalPages <= 1 && !showSummary) return null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4",
        className
      )}
    >
      {/* Summary Text */}
      {showSummary && totalItems !== undefined && (
        <p className="text-sm text-slate-500 font-medium">
          Showing <span className="text-slate-900 font-bold">{startItem}</span> to{" "}
          <span className="text-slate-900 font-bold">{endItem}</span> of{" "}
          <span className="text-slate-900 font-bold">{totalItems}</span> results
        </p>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition-all duration-200 shadow-sm"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Desktop Page Numbers */}
        <div className="hidden sm:flex items-center gap-2">
          {pages.map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <span className="px-2 text-slate-400">
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={cn(
                    "min-w-[40px] h-10 px-3 rounded-lg text-sm font-semibold transition-all duration-200 border shadow-sm",
                    currentPage === page
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900"
                  )}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile Page Counter (Alternative to full list) */}
        <span className="sm:hidden text-sm text-slate-600 font-medium px-2">
          Page <span className="text-slate-900 font-bold">{currentPage}</span> of {totalPages}
        </span>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition-all duration-200 shadow-sm"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};