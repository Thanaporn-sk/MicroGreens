import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus } from 'lucide-react';
import Search from '@/app/ui/search';
import CustomersList from './customers-list';

export default async function CustomersPage(props: {
    searchParams?: Promise<{
        query?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';

    const customers = await prisma.customer.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { contact: { contains: query } },
            ]
        },
        orderBy: { createdAt: 'desc' },
        include: { sales: true }
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

            <div className="mb-4">
                <Search placeholder="Search customers..." />
            </div>

            <CustomersList customers={customers} />
        </div>
    );
}
