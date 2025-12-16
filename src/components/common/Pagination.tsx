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
                <p className="text-sm text-gray-600 font-medium">
                    Showing <span className="text-gray-900">{startItem}</span> to{" "}
                    <span className="text-gray-900">{endItem}</span> of{" "}
                    <span className="text-gray-900">{totalItems}</span> results
                </p>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-colors duration-200"
                    aria-label="Previous Page"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="hidden sm:flex items-center space-x-1">
                    {pages.map((page, index) => (
                        <React.Fragment key={index}>
                            {page === "..." ? (
                                <span className="px-2 text-gray-400">
                                    <MoreHorizontal className="w-4 h-4" />
                                </span>
                            ) : (
                                <button
                                    onClick={() => onPageChange(page as number)}
                                    className={cn(
                                        "min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors duration-200",
                                        currentPage === page
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    )}
                                >
                                    {page}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <span className="sm:hidden text-sm text-gray-600 font-medium px-2">
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-colors duration-200"
                    aria-label="Next Page"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
