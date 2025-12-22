'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, List, Filter } from 'lucide-react';


export default function LotFilters({ crops }: { crops: string[] }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const toggleView = (view: 'grid' | 'table') => {
        handleFilterChange('view', view);
    };

    const currentView = searchParams.get('view') || 'grid';
    const currentStatus = searchParams.get('status') || '';
    const currentCrop = searchParams.get('crop') || '';

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm mb-6">
            <div className="flex flex-1 gap-4 w-full sm:w-auto">
                {/* Status Filter */}
                <select
                    className="border rounded p-2 text-sm w-full sm:w-40"
                    value={currentStatus}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="PLANTED">Growing</option>
                    <option value="HARVESTING">Harvesting</option>
                    <option value="COMPLETED">Harvested</option>
                </select>

                {/* Crop Filter */}
                <select
                    className="border rounded p-2 text-sm w-full sm:w-40"
                    value={currentCrop}
                    onChange={(e) => handleFilterChange('crop', e.target.value)}
                >
                    <option value="">All Crops</option>
                    {crops.map((crop) => (
                        <option key={crop} value={crop}>
                            {crop}
                        </option>
                    ))}
                </select>
            </div>

            {/* View Toggle */}
            <div className="flex border rounded overflow-hidden">
                <button
                    onClick={() => toggleView('grid')}
                    className={`p-2 ${currentView === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    title="Grid View"
                >
                    <LayoutGrid size={20} />
                </button>
                <button
                    onClick={() => toggleView('table')}
                    className={`p-2 ${currentView === 'table' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    title="Table View"
                >
                    <List size={20} />
                </button>
            </div>
        </div>
    );
}
