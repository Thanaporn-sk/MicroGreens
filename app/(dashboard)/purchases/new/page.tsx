import { prisma } from '@/lib/prisma';
import PurchaseForm from './purchase-form';

export default async function NewPurchasePage() {
    const materials = await prisma.material.findMany({
        orderBy: { name: 'asc' },
    });

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6">Record Purchase</h1>
            <PurchaseForm materials={materials} />
        </div>
    );
}
