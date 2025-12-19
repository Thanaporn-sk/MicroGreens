import { prisma } from '@/lib/prisma';
import HarvestForm from './harvest-form';

export default async function HarvestPage(props: { params: Promise<{ lotId: string }> }) {
    const params = await props.params;
    const lotId = parseInt(params.lotId);
    const lot = await prisma.plantingLot.findUnique({
        where: { id: lotId },
        include: {
            harvests: {
                include: { material: true },
                orderBy: { harvestDate: 'desc' }
            }
        }
    });

    const materials = await prisma.material.findMany({
        include: { stock: true },
        orderBy: { name: 'asc' }
    });

    if (!lot) return <div>Lot not found</div>;

    const serializedLot = JSON.parse(JSON.stringify(lot));

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6">Harvest Lot: {lot.lotCode}</h1>
            <HarvestForm lot={serializedLot} materials={materials} />
        </div>
    );
}
