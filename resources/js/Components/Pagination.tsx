import { Link } from '@inertiajs/react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

export default function Pagination({
    lastPage,
    total,
    from,
    to,
    links,
}: PaginationProps) {
    return (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            {lastPage > 1 ? (
                <div className="flex items-center justify-between">
                    <div className="flex flex-1 justify-between sm:hidden">
                        {/* Mobile pagination */}
                        {links[0]?.url ? (
                            <Link
                                href={links[0].url || ''}
                                preserveState
                                preserveScroll
                                className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Previous
                            </Link>
                        ) : (
                            <span className="relative inline-flex items-center rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400">
                                Previous
                            </span>
                        )}
                        {links[links.length - 1]?.url ? (
                            <Link
                                href={links[links.length - 1].url || ''}
                                preserveState
                                preserveScroll
                                className="relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Next
                            </Link>
                        ) : (
                            <span className="relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400">
                                Next
                            </span>
                        )}
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing{' '}
                                <span className="font-medium">{from}</span> to{' '}
                                <span className="font-medium">{to}</span> of{' '}
                                <span className="font-medium">{total}</span>{' '}
                                results
                            </p>
                        </div>
                        <div>
                            <nav
                                className="isolate inline-flex -space-x-px rounded-lg shadow-sm"
                                aria-label="Pagination"
                            >
                                {links.map((link, index) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={index}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-400 ${
                                                    index === 0
                                                        ? 'rounded-l-lg'
                                                        : index ===
                                                            links.length - 1
                                                          ? 'rounded-r-lg'
                                                          : ''
                                                } border border-gray-300 bg-gray-100`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={index}
                                            href={link.url || ''}
                                            preserveState
                                            preserveScroll
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                                index === 0
                                                    ? 'rounded-l-lg'
                                                    : index === links.length - 1
                                                      ? 'rounded-r-lg'
                                                      : ''
                                            } ${
                                                link.active
                                                    ? 'z-10 border border-blue-500 bg-blue-50 text-blue-600'
                                                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full">
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{from}</span> to{' '}
                        <span className="font-medium">{to}</span> of{' '}
                        <span className="font-medium">{total}</span>{' '}
                        {total === 1 ? 'result' : 'results'}
                    </p>
                </div>
            )}
        </div>
    );
}
