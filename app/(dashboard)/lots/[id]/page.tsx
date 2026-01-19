import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { LotDetailCard } from '@/app/ui/lots/lot-detail-card';
import LotDetailsTabs from '@/app/ui/lots/lot-details-tabs';

export default async function LotDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);
    const lot = await prisma.plantingLot.findUnique({
        where: { id },
        include: {
            harvests: {
                orderBy: { harvestDate: 'desc' },
                include: { material: true }
            },
            events: {
                orderBy: [
                    { date: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: { images: true }
            },
            images: {
                where: { eventId: null },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!lot) {
        notFound();
    }

    const { events, harvests, images: orphanImages, ...lotDetails } = lot;

    // Calculate Yields
    const totalYield = harvests.reduce((sum, h) => sum + h.weight, 0);
    const trayCount = lot.trayCount || 1;
    const efficiency = parseFloat((totalYield / trayCount).toFixed(2));

    const lotDetailsWithYield = {
        ...lotDetails,
        totalYield,
        yield: efficiency
    };

    const statusLabels: Record<string, string> = {
        'PLANTED': 'Growing',
        'HARVESTING': 'Harvesting',
        'COMPLETED': 'Harvested'
    };
    const status = lot.status;
    const label = statusLabels[status] || status;

    return (
        <div className="w-full space-y-6">
            <div>
                <Link href="/lots" className="text-gray-500 hover:text-gray-900 flex items-center text-sm mb-4">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Lots
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">{lot.lotCode}</h1>
                        <p className="text-gray-500">{lot.cropType}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/lots/${lot.id}/edit`}
                            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1 rounded-md text-sm font-medium flex items-center transition-colors"
                        >
                            <Pencil className="w-3 h-3 mr-2" />
                            Edit
                        </Link>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${status === 'PLANTED' ? 'bg-green-100 text-green-800' :
                            status === 'HARVESTING' ? 'bg-yellow-100 text-yellow-800' :
                                status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {label}
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout: Details on top, Tabs below */}
            <div className="w-full">
                <LotDetailCard lot={lotDetailsWithYield} />
            </div>

            <div className="w-full">
                <LotDetailsTabs
                    lotId={lot.id}
                    events={events}
                    harvests={harvests}
                    orphanImages={orphanImages}
                />
            </div>
        </div>
    );
}
