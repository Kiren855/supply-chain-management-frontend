import { useMemo, useState, useEffect, useRef } from 'react';

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
    const [showJumpInput, setShowJumpInput] = useState(false);
    const [jumpPage, setJumpPage] = useState('');
    const inputRef = useRef(null);

    const paginationRange = useMemo(() => {
        const totalPageCount = totalPages;
        const pageNumber = currentPage + 1;
        const totalPageNumbers = siblingCount + 5;

        if (totalPageNumbers >= totalPageCount) {
            return range(1, totalPageCount);
        }

        const leftSiblingIndex = Math.max(pageNumber - siblingCount, 2);
        const rightSiblingIndex = Math.min(pageNumber + siblingCount, totalPageCount - 1);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPageCount - 1;

        const firstPageIndex = 1;
        const lastPageIndex = totalPageCount;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftRange = range(1, 1 + 2 * siblingCount + 1);
            return [...leftRange, DOTS, totalPageCount];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightRange = range(totalPageCount - 2 * siblingCount - 1, totalPageCount);
            return [firstPageIndex, DOTS, ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [firstPageIndex, ...middleRange, DOTS, lastPageIndex];
        }
    }, [totalPages, currentPage, siblingCount]);

    useEffect(() => {
        if (showJumpInput && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showJumpInput]);

    const handleDotsClick = () => {
        setShowJumpInput(true);
    };

    const handleJumpPageChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setJumpPage(value);
    };

    const handleJumpPageKeyDown = (e) => {
        if (e.key === 'Enter') {
            const pageNumber = parseInt(jumpPage, 10);
            if (pageNumber >= 1 && pageNumber <= totalPages) {
                onPageChange(pageNumber - 1);
            }
            setShowJumpInput(false);
            setJumpPage('');
        }
    };

    const handleInputBlur = () => {
        setShowJumpInput(false);
        setJumpPage('');
    };

    if (currentPage < 0 || !paginationRange || paginationRange.length < 2) {
        return null;
    }

    let dotsCount = 0;

    const onNext = () => {
        onPageChange(currentPage + 1);
    };

    const onPrevious = () => {
        onPageChange(currentPage - 1);
    };

    return (
        <nav>
            <ul className="inline-flex items-center -space-x-px">
                {/* 1. THÊM NÚT PREVIOUS */}
                <li>
                    <button
                        onClick={onPrevious}
                        disabled={currentPage === 0}
                        className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        Prev
                    </button>
                </li>

                {paginationRange.map((pageNumber, index) => {
                    if (pageNumber === DOTS) {
                        dotsCount++;
                        const isLeftDots = dotsCount === 1 && paginationRange.includes(DOTS, index + 1);

                        if (!isLeftDots && showJumpInput) {
                            return (
                                <li key={`jump-input`}>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={jumpPage}
                                        onChange={handleJumpPageChange}
                                        onKeyDown={handleJumpPageKeyDown}
                                        onBlur={handleInputBlur}
                                        className="w-14 text-center px-2 py-2 leading-tight border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="..."
                                    />
                                </li>
                            );
                        }

                        return (
                            <li key={`dots-${index}`}>
                                {isLeftDots ? (
                                    <span className="px-3 py-2 text-gray-500 border border-gray-300">...</span>
                                ) : (
                                    <button onClick={handleDotsClick} className="px-3 py-2 text-gray-500 border border-gray-300 hover:bg-gray-100">
                                        ...
                                    </button>
                                )}
                            </li>
                        );
                    }

                    const isFirstPageButton = index === 0 && paginationRange[1] === DOTS;

                    return (
                        <li key={index} className={isFirstPageButton ? 'mr-2' : ''}>
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

                {/* 2. THÊM NÚT NEXT */}
                <li>
                    <button
                        onClick={onNext}
                        disabled={currentPage === totalPages - 1}
                        className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    );
}