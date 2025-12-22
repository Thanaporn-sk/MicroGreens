import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus } from 'lucide-react';
import Search from '@/app/ui/search';
import PurchasesTable from './purchases-table';

// ... imports
import { Prisma } from '@prisma/client';

export default async function PurchasesPage(props: {
    searchParams?: Promise<{
        query?: string;
        sort?: string;
        order?: 'asc' | 'desc';
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const sort = searchParams?.sort || 'date';
    const order = searchParams?.order || 'desc';

    const orderBy: Prisma.PurchaseOrderByWithRelationInput = {};
    if (sort === 'material') {
        orderBy.material = { name: order };
    } else {
        orderBy[sort as keyof Prisma.PurchaseOrderByWithRelationInput] = order;
    }

    const purchases = await prisma.purchase.findMany({
        where: {
            material: {
                name: { contains: query, mode: 'insensitive' }
            }
        },
        include: { material: true },
        orderBy: orderBy,
    });

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Purchases</h1>
                <Link
                    href="/purchases/new"
                    className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Record Purchase
                </Link>
            </div>

            <div className="mb-4">
                <Search placeholder="Search purchases by material name..." />
            </div>

            <PurchasesTable purchases={purchases} />
        </div>
    );
}
