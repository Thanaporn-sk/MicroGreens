'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function CustomerSortControls() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentSort = searchParams.get('sort') || 'createdAt';
    const currentOrder = searchParams.get('order') || 'desc';

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [sort, order] = e.target.value.split('-');
        const params = new URLSearchParams(searchParams);
        params.set('sort', sort);
        params.set('order', order);
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <select
            className="rounded-md border border-gray-200 py-2 pl-3 pr-10 text-sm outline-2 placeholder:text-gray-500"
            defaultValue={`${currentSort}-${currentOrder}`}
            onChange={handleSortChange}
        >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
        </select>
    );
}
