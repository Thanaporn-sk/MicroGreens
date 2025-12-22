import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus, Eye } from 'lucide-react';
import DeleteButton from '@/app/ui/delete-button';
import { deletePlantingLot } from '@/app/lib/actions';
import { formatDate } from '@/app/lib/formatters';
import { Prisma } from '@prisma/client';

import Search from '@/app/ui/search';
import LotFilters from '@/app/ui/lots/lot-filters';
import LotsTable from '@/app/ui/lots/lots-table';

// ... imports

export default async function LotsPage(props: {
    searchParams?: Promise<{
        query?: string;
        status?: string;
        crop?: string;
        view?: 'grid' | 'table';
        sort?: string;
        order?: 'asc' | 'desc';
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const statusParam = searchParams?.status;
    const cropParam = searchParams?.crop;
    const view = searchParams?.view || 'grid';
    const sort = searchParams?.sort || 'plantingDate'; // Default sort
    const order = searchParams?.order || 'desc';

    // 1. Build Filter
    const where: Prisma.PlantingLotWhereInput = {};

    if (query) {
        where.lotCode = { contains: query };
    }
    if (statusParam) {
        where.status = statusParam;
    }
    if (cropParam) {
        where.cropType = cropParam;
    }

    // 2. Fetch Data
    const lotsRaw = await prisma.plantingLot.findMany({
        where,
        orderBy: { [sort]: order },
        include: { harvests: { select: { weight: true } } }
    });

    // 3. Calculate Derived Metrics (Total Weight)
    const lots = lotsRaw.map(lot => {
        const totalWeight = lot.harvests.reduce((sum, h) => sum + h.weight, 0);
        return {
            ...lot,
            totalWeight
        };
    });

    // 4. Fetch Crop List for Filter
    const cropsData = await prisma.plantingLot.groupBy({
        by: ['cropType'],
    });
    const crops = cropsData.map(c => c.cropType).sort();

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Planting Lots</h1>
                <Link
                    href="/lots/new"
                    className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    New Lot
                </Link>
            </div>

            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <Search placeholder="Search lot code..." />
            </div>

            <LotFilters crops={crops} />

            {view === 'table' ? (
                <LotsTable lots={lots} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lots.length === 0 ? (
                        <p className="col-span-full text-center text-gray-500">No planting lots found.</p>
                    ) : (
                        lots.map((lot) => {
                            const status = lot.status;
                            const statusLabels: Record<string, string> = {
                                'PLANTED': 'Growing',
                                'HARVESTING': 'Harvesting',
                                'COMPLETED': 'Harvested'
                            };
                            const label = statusLabels[status] || status;
                            return (
                                <div key={lot.id} className="bg-white rounded-lg shadow border p-6 hover:shadow-md transition-shadow relative group">
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <DeleteButton id={lot.id} deleteAction={deletePlantingLot} />
                                    </div>
                                    <Link href={`/lots/${lot.id}`} className="block">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{lot.lotCode}</h3>
                                                <p className="text-sm text-gray-500">{lot.cropType}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${status === 'PLANTED' ? 'bg-green-100 text-green-800' :
                                                status === 'HARVESTING' ? 'bg-yellow-100 text-yellow-800' :
                                                    status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {label}
                                            </span>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            <p className="text-sm text-gray-600">Planted: <span className="font-medium">{formatDate(lot.plantingDate)}</span></p>
                                            {lot.expectedHarvestDate && (
                                                <p className="text-sm text-blue-600">Exp. Harvest: <span className="font-medium">{formatDate(lot.expectedHarvestDate)}</span></p>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Trays</p>
                                                <p className="font-semibold text-lg">{lot.trayCount}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Yield</p>
                                                <p className="font-semibold text-lg">{lot.totalWeight} g</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-2 flex justify-between items-center text-blue-600 font-medium text-sm">
                                            <span className="flex items-center">
                                                <Eye className="w-4 h-4 mr-1" /> View Details
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
