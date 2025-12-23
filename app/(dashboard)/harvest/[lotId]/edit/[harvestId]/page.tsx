import { prisma } from '@/lib/prisma';
import HarvestForm from '../../harvest-form';
import { notFound } from 'next/navigation';

export default async function EditHarvestPage(props: { params: Promise<{ lotId: string, harvestId: string }> }) {
    const params = await props.params;
    const lotId = parseInt(params.lotId);
    const harvestId = parseInt(params.harvestId);

    const lot = await prisma.plantingLot.findUnique({
        where: { id: lotId },
        include: {
            harvests: {
                include: { material: true },
                orderBy: { harvestDate: 'desc' }
            }
        }
    });

    if (!lot) notFound();

    const harvest = await prisma.harvest.findUnique({
        where: { id: harvestId },
        include: { material: true }
    });

    if (!harvest) notFound();

    const materials = await prisma.material.findMany({
        include: { stock: true },
        orderBy: { name: 'asc' }
    });

    const serializedLot = JSON.parse(JSON.stringify(lot));
    const serializedHarvest = JSON.parse(JSON.stringify(harvest));

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6">Edit Harvest: {lot.lotCode}</h1>
            <HarvestForm
                lot={serializedLot}
                materials={materials}
                harvest={serializedHarvest}
            />
        </div>
    );
}
