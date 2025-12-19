import { prisma } from '@/lib/prisma';
import PurchaseForm from './purchase-form';

export const dynamic = 'force-dynamic';

export default async function NewPurchasePage() {
    let materials: any[] = [];
    let error = null;

    try {
        materials = await prisma.material.findMany({
            orderBy: { name: 'asc' },
        });
    } catch (e) {
        console.error('Failed to load materials:', e);
        error = "Failed to load materials. Please check database connection.";
    }

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6">Record Purchase</h1>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <PurchaseForm materials={materials} />
        </div>
    );
}
