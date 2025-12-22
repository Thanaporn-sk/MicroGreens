import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus } from 'lucide-react';
import Search from '@/app/ui/search';
import CustomersList from './customers-list';
import CustomersTable from '@/app/ui/customers/customers-table';
import { Prisma } from '@prisma/client';
import CustomerSortControls from '@/app/ui/customers/customer-sort';
import ViewToggle from '@/app/ui/view-toggle';

export default async function CustomersPage(props: {
    searchParams?: Promise<{
        query?: string;
        sort?: string;
        order?: 'asc' | 'desc';
        view?: 'grid' | 'table';
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const sort = searchParams?.sort || 'createdAt';
    const order = searchParams?.order || 'desc';
    const view = searchParams?.view || 'grid';

    const orderBy: Prisma.CustomerOrderByWithRelationInput = {};
    if (sort) {
        orderBy[sort as keyof Prisma.CustomerOrderByWithRelationInput] = order;
    }

    const customersRaw = await prisma.customer.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { contact: { contains: query, mode: 'insensitive' } }
            ]
        },
        include: { sales: true },
        orderBy: orderBy,
    });

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Customers</h1>
                <Link href="/customers/new" className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Customer
                </Link>
            </div>

            <div className="mb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full md:w-auto">
                    <Search placeholder="Search customers..." />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Sort:</span>
                        <CustomerSortControls />
                    </div>
                    <ViewToggle />
                </div>
            </div>

            {view === 'table' ? (
                <CustomersTable customers={customersRaw} />
            ) : (
                <CustomersList customers={customersRaw} />
            )}
        </div>
    );
}
