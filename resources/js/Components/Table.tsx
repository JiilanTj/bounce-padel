import { ReactNode } from 'react';

interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => ReactNode;
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    onSort?: (column: string) => void;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    emptyMessage?: string;
    emptyDescription?: string;
}

export default function Table<T extends { id: number | string }>({
    columns,
    data,
    onSort,
    sortBy,
    sortOrder = 'asc',
    emptyMessage = 'No data found',
    emptyDescription = 'Try adjusting your search or filter',
}: TableProps<T>) {
    const SortIcon = ({ column }: { column: string }) => {
        if (!sortBy || sortBy !== column) {
            return (
                <svg
                    className="ml-1.5 h-3.5 w-3.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                </svg>
            );
        }

        return sortOrder === 'asc' ? (
            <svg
                className="ml-1.5 h-3.5 w-3.5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                />
            </svg>
        ) : (
            <svg
                className="ml-1.5 h-3.5 w-3.5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        );
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-3 text-left ${column.className || ''}`}
                                >
                                    {column.sortable && onSort ? (
                                        <button
                                            onClick={() => onSort(column.key)}
                                            className={`flex w-full items-center text-xs font-medium uppercase tracking-wide text-gray-500 hover:text-gray-700 ${
                                                column.className?.includes(
                                                    'text-right',
                                                )
                                                    ? 'justify-end'
                                                    : column.className?.includes(
                                                            'text-center',
                                                        )
                                                      ? 'justify-center'
                                                      : 'justify-start'
                                            }`}
                                        >
                                            {column.label}
                                            <SortIcon column={column.key} />
                                        </button>
                                    ) : (
                                        <span
                                            className={`block w-full text-xs font-medium uppercase tracking-wide text-gray-500 ${
                                                column.className?.includes(
                                                    'text-right',
                                                )
                                                    ? 'text-right'
                                                    : column.className?.includes(
                                                            'text-center',
                                                        )
                                                      ? 'text-center'
                                                      : 'text-left'
                                            }`}
                                        >
                                            {column.label}
                                        </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-12 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                            <svg
                                                className="h-6 w-6 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {emptyMessage}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {emptyDescription}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr
                                    key={item.id}
                                    className="transition-colors hover:bg-gray-50"
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={`whitespace-nowrap px-4 py-3 ${column.className || ''}`}
                                        >
                                            {column.render
                                                ? column.render(item)
                                                : String(
                                                      (
                                                          item as Record<
                                                              string,
                                                              unknown
                                                          >
                                                      )[column.key],
                                                  )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
