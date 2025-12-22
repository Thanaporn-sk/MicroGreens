'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

export default function SortableHeader({
    label,
    value,
    className = ""
}: {
    label: string;
    value: string;
    className?: string
}) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentSort = searchParams.get('sort');
    const currentOrder = searchParams.get('order');

    const handleSort = () => {
        const params = new URLSearchParams(searchParams);

        if (currentSort === value) {
            if (currentOrder === 'asc') {
                params.set('order', 'desc');
            } else {
                params.set('order', 'asc');
            }
        } else {
            params.set('sort', value);
            params.set('order', 'asc');
        }

        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <button
            onClick={handleSort}
            className={`flex items-center gap-1 font-medium hover:text-gray-700 uppercase tracking-wider ${className}`}
        >
            {label}
            {currentSort === value ? (
                currentOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
            ) : (
                <ArrowUpDown className="w-4 h-4 opacity-30" />
            )}
        </button>
    );
}
