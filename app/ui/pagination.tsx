'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ totalPages }: { totalPages: number }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-4 py-3 sm:px-6 mt-6 rounded-xl shadow-sm">
            <div className="flex flex-1 justify-between sm:hidden">
                <PaginationButton
                    href={createPageURL(currentPage - 1)}
                    isDisabled={currentPage <= 1}
                >
                    Previous
                </PaginationButton>
                <PaginationButton
                    href={createPageURL(currentPage + 1)}
                    isDisabled={currentPage >= totalPages}
                >
                    Next
                </PaginationButton>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 italic">
                        Page <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> of{' '}
                        <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm overflow-hidden" aria-label="Pagination">
                        <PaginationArrow
                            direction="left"
                            href={createPageURL(currentPage - 1)}
                            isDisabled={currentPage <= 1}
                        />

                        {/* Dynamic Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => {
                                // Show first, last, and pages around current
                                return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                            })
                            .map((page, index, array) => {
                                const elements = [];
                                if (index > 0 && page - array[index - 1] > 1) {
                                    elements.push(
                                        <span key={`ellipsis-${page}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400 ring-1 ring-inset ring-gray-200 dark:ring-gray-700">
                                            ...
                                        </span>
                                    );
                                }
                                elements.push(
                                    <Link
                                        key={page}
                                        href={createPageURL(page)}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-bold transition-all duration-200 ${currentPage === page
                                            ? 'z-10 bg-green-600 dark:bg-green-500 text-white shadow-inner scale-105'
                                            : 'text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0'
                                            }`}
                                    >
                                        {page}
                                    </Link>
                                );
                                return elements;
                            })}

                        <PaginationArrow
                            direction="right"
                            href={createPageURL(currentPage + 1)}
                            isDisabled={currentPage >= totalPages}
                        />
                    </nav>
                </div>
            </div>
        </div>
    );
}

function PaginationButton({
    href,
    children,
    isDisabled
}: {
    href: string,
    children: React.ReactNode,
    isDisabled?: boolean
}) {
    if (isDisabled) {
        return (
            <span className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 dark:text-gray-600 cursor-not-allowed">
                {children}
            </span>
        );
    }

    return (
        <Link
            href={href}
            className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
            {children}
        </Link>
    );
}

function PaginationArrow({
    href,
    direction,
    isDisabled,
}: {
    href: string;
    direction: 'left' | 'right';
    isDisabled?: boolean;
}) {
    const icon = direction === 'left' ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />;

    if (isDisabled) {
        return (
            <span className={`relative inline-flex items-center px-2 py-2 text-gray-300 dark:text-gray-600 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 cursor-not-allowed ${direction === 'left' ? 'rounded-l-md' : 'rounded-r-md'
                }`}>
                {icon}
            </span>
        );
    }

    return (
        <Link
            href={href}
            className={`relative inline-flex items-center px-2 py-2 text-gray-400 dark:text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 ${direction === 'left' ? 'rounded-l-md' : 'rounded-r-md'
                }`}
        >
            {icon}
        </Link>
    );
}
