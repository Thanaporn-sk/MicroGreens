import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus } from 'lucide-react';
import Search from '@/app/ui/search';
import PurchasesTable from './purchases-table';

// ... imports
import { Prisma } from '@prisma/client';
import { getRowsPerPage } from '@/app/lib/user-settings';

export default async function PurchasesPage(props: {
    searchParams?: Promise<{
        query?: string;
        sort?: string;
        order?: 'asc' | 'desc';
        page?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const sort = searchParams?.sort || 'date';
    const order = searchParams?.order || 'desc';
    const page = Number(searchParams?.page) || 1;
    const itemsPerPage = await getRowsPerPage();

    const where: Prisma.PurchaseWhereInput = {
        material: {
            name: { contains: query, mode: 'insensitive' }
        }
    };

    const orderBy: Prisma.PurchaseOrderByWithRelationInput = {};
    if (sort === 'material') {
        orderBy.material = { name: order };
    } else {
        orderBy[sort as keyof Prisma.PurchaseOrderByWithRelationInput] = order;
    }

    const [totalPurchases, purchases] = await Promise.all([
        prisma.purchase.count({ where }),
        prisma.purchase.findMany({
            where,
            include: { material: true },
            orderBy: orderBy,
            skip: (page - 1) * itemsPerPage,
            take: itemsPerPage,
        })
    ]);

    const totalPages = Math.ceil(totalPurchases / itemsPerPage);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <h1 className="text-2xl font-bold dark:text-gray-100">Purchases</h1>
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

            <PurchasesTable purchases={purchases} totalPages={totalPages} currentPage={page} />
        </div>
    );
}
