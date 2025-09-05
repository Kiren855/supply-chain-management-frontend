import { useMemo } from 'react';

const DOTS = '...';

const range = (start, end) => {
    let length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
};

export default function Pagination({
    totalPages,
    currentPage, // page number is 0-indexed
    onPageChange,
    siblingCount = 1
}) {
    const paginationRange = useMemo(() => {
        const totalPageNumbers = siblingCount + 5;

        // Case 1: Số trang ít hơn số trang muốn hiển thị -> hiển thị tất cả
        if (totalPageNumbers >= totalPages) {
            return range(1, totalPages);
        }

        const leftSiblingIndex = Math.max(currentPage + 1 - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + 1 + siblingCount, totalPages);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

        const firstPageIndex = 1;
        const lastPageIndex = totalPages;

        // Case 2: Không hiển thị ... bên trái, chỉ hiển thị ... bên phải
        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 3 + 2 * siblingCount;
            let leftRange = range(1, leftItemCount);
            return [...leftRange, DOTS, totalPages];
        }

        // Case 3: Không hiển thị ... bên phải, chỉ hiển thị ... bên trái
        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 3 + 2 * siblingCount;
            let rightRange = range(totalPages - rightItemCount + 1, totalPages);
            return [firstPageIndex, DOTS, ...rightRange];
        }

        // Case 4: Hiển thị ... ở cả 2 bên
        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
        }
    }, [totalPages, currentPage, siblingCount]);

    if (currentPage < 0 || paginationRange.length < 2) {
        return null;
    }

    return (
        <nav>
            <ul className="inline-flex items-center -space-x-px">
                {paginationRange.map((pageNumber, index) => {
                    if (pageNumber === DOTS) {
                        return <li key={index} className="px-3 py-2 text-gray-500">...</li>;
                    }

                    return (
                        <li key={index}>
                            <button
                                onClick={() => onPageChange(pageNumber - 1)}
                                className={`px-3 py-2 leading-tight border transition-colors
                                    ${pageNumber - 1 === currentPage
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                            >
                                {pageNumber}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}