'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function DateFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    function handleSearch(term: string, type: 'startDate' | 'endDate') {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set(type, term);
        } else {
            params.delete(type);
        }
        replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex gap-4 items-end mb-6 bg-white p-4 rounded-lg shadow-sm w-fit">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                    type="date"
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={startDate}
                    onChange={(e) => handleSearch(e.target.value, 'startDate')}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                    type="date"
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={endDate}
                    onChange={(e) => handleSearch(e.target.value, 'endDate')}
                />
            </div>
            <button
                onClick={() => replace(pathname)}
                className="text-sm text-gray-500 hover:text-gray-700 pb-2.5 underline"
            >
                Clear
            </button>
        </div>
    );
}
