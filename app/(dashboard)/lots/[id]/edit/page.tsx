import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditLotForm from './edit-form';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lotId = parseInt(id);
    if (isNaN(lotId)) notFound();

    const lot = await prisma.plantingLot.findUnique({
        where: { id: lotId },
    });

    if (!lot) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Planting Lot</h1>
            <EditLotForm lot={lot} />
        </div>
    );
}
