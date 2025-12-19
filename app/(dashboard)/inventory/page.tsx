import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus } from 'lucide-react';
import InventoryTable from '@/app/(dashboard)/inventory/inventory-table';
import Search from '@/app/ui/search';

type MaterialWithStock = {
    id: number;
    name: string;
    unit: string;
    stock: { quantity: number } | null;
};

export default async function InventoryPage(props: {
    searchParams?: Promise<{
        query?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';

    const materials = await prisma.material.findMany({
        where: {
            name: { contains: query }
        },
        include: { stock: true },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Inventory & Stock</h1>
                <Link
                    href="/inventory/new"
                    className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    New Material
                </Link>
            </div>

            <div className="mb-4">
                <Search placeholder="Search materials..." />
            </div>

            <InventoryTable materials={materials} />
        </div>
    );
}
