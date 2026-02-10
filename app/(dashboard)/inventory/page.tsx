import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus } from 'lucide-react';
import InventoryTable from '@/app/(dashboard)/inventory/inventory-table';
import Search from '@/app/ui/search';

import { Prisma } from '@prisma/client';
import { getRowsPerPage } from '@/app/lib/user-settings';

export default async function InventoryPage(props: {
    searchParams?: Promise<{
        query?: string;
        type?: string;
        buySale?: string;
        sort?: string;
        order?: 'asc' | 'desc';
        page?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const type = searchParams?.type || '';
    const buySale = searchParams?.buySale || '';
    const sort = searchParams?.sort || 'name';
    const order = searchParams?.order || 'asc';
    const page = Number(searchParams?.page) || 1;
    const itemsPerPage = await getRowsPerPage();

    const where: Prisma.MaterialWhereInput = {
        name: { contains: query, mode: 'insensitive' }
    };

    if (type) {
        where.type = type as Prisma.EnumMaterialTypeFilter;
    }

    if (buySale) {
        where.buySale = buySale as Prisma.EnumMaterialFlowFilter;
    }

    const orderBy: Prisma.MaterialOrderByWithRelationInput = {};
    if (sort === 'stock') {
        orderBy.stock = { quantity: order };
    } else {
        orderBy[sort as keyof Prisma.MaterialOrderByWithRelationInput] = order;
    }

    const [totalMaterials, materials] = await Promise.all([
        prisma.material.count({ where }),
        prisma.material.findMany({
            where,
            include: {
                stock: true,
                images: {
                    select: { url: true }
                }
            },
            orderBy: orderBy,
            skip: (page - 1) * itemsPerPage,
            take: itemsPerPage,
        })
    ]);

    const totalPages = Math.ceil(totalMaterials / itemsPerPage);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <h1 className="text-2xl font-bold dark:text-gray-100">Inventory & Stock</h1>
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

            <InventoryTable materials={materials} totalPages={totalPages} />
        </div>
    );
}
