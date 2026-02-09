import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus } from 'lucide-react';
import Search from '@/app/ui/search';
import SalesTable from './sales-table';
import { Prisma } from '@prisma/client';
import { getRowsPerPage } from '@/app/lib/user-settings';

export default async function SalesPage(props: {
    searchParams?: Promise<{
        query?: string;
        sort?: string;
        order?: 'asc' | 'desc';
        page?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const sort = searchParams?.sort || 'saleDate';
    const order = searchParams?.order || 'desc';

    const page = Number(searchParams?.page) || 1;
    const itemsPerPage = await getRowsPerPage();

    const where: Prisma.SaleWhereInput = {
        OR: [
            { productName: { contains: query, mode: 'insensitive' } },
            { customer: { name: { contains: query, mode: 'insensitive' } } }
        ]
    };

    const orderBy: Prisma.SaleOrderByWithRelationInput = {};
    if (sort === 'customer') {
        orderBy.customer = { name: order };
    } else {
        orderBy[sort as keyof Prisma.SaleOrderByWithRelationInput] = order;
    }

    const [totalSales, sales] = await Promise.all([
        prisma.sale.count({ where }),
        prisma.sale.findMany({
            where,
            include: { customer: true },
            orderBy: orderBy,
            skip: (page - 1) * itemsPerPage,
            take: itemsPerPage,
        })
    ]);

    const totalPages = Math.ceil(totalSales / itemsPerPage);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <h1 className="text-2xl font-bold dark:text-white">Sales Record</h1>
                <Link
                    href="/sales/new"
                    className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Record Sale
                </Link>
            </div>

            <div className="mb-4">
                <Search placeholder="Search sales by product or customer..." />
            </div>

            {/* @ts-ignore */}
            <SalesTable sales={sales} totalPages={totalPages} currentPage={page} />
        </div>
    );
}
