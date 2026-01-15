'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function InventoryReportFilters({
    materialNames,
    initialStartDate,
    initialEndDate
}: {
    materialNames: string[]
    initialStartDate: string;
    initialEndDate: string;
}) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const startDate = searchParams.get('startDate') || initialStartDate;
    const endDate = searchParams.get('endDate') || initialEndDate;
    const selectedItem = searchParams.get('itemName') || '';

    function handleSearch(term: string, type: 'startDate' | 'endDate' | 'itemName') {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set(type, term);
        } else {
            params.delete(type);
        }
        replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex flex-wrap gap-4 items-end mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm w-fit border border-gray-100 dark:border-gray-700">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                    type="date"
                    className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    value={startDate}
                    onChange={(e) => handleSearch(e.target.value, 'startDate')}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                    type="date"
                    className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    value={endDate}
                    onChange={(e) => handleSearch(e.target.value, 'endDate')}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inventory Name</label>
                <select
                    className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-48"
                    value={selectedItem}
                    onChange={(e) => handleSearch(e.target.value, 'itemName')}
                >
                    <option value="">All Items</option>
                    {materialNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>

            <button
                onClick={() => replace(pathname)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 pb-2.5 underline"
            >
                Clear
            </button>
        </div>
    );
}
