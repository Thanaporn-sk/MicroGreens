import { prisma } from '@/lib/prisma';
import LotForm from './lot-form';

export default async function NewLotPage() {
    const materials = await prisma.material.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6">Create Planting Lot</h1>
            <LotForm materials={materials} />
        </div>
    );
}
