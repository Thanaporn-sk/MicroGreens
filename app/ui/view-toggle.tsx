'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';

export default function ViewToggle() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentView = searchParams.get('view') || 'grid';

    const handleViewChange = (view: 'grid' | 'table') => {
        const params = new URLSearchParams(searchParams);
        params.set('view', view);
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex border rounded overflow-hidden">
            <button
                onClick={() => handleViewChange('grid')}
                className={`p-2 ${currentView === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                title="Grid View"
            >
                <LayoutGrid size={20} />
            </button>
            <button
                onClick={() => handleViewChange('table')}
                className={`p-2 ${currentView === 'table' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                title="Table View"
            >
                <List size={20} />
            </button>
        </div>
    );
}
