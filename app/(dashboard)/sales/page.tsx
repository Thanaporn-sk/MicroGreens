import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus } from 'lucide-react';
import Search from '@/app/ui/search';
import SalesTable from './sales-table';

export default async function SalesPage(props: {
    searchParams?: Promise<{
        query?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';

    const sales = await prisma.sale.findMany({
        where: {
            OR: [
                { productName: { contains: query } },
                { customer: { name: { contains: query } } }
            ]
        },
        include: { customer: true },
        orderBy: { saleDate: 'desc' },
    });

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Sales Record</h1>
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

            <SalesTable sales={sales} />
        </div>
    );
}
