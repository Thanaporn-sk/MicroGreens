import { prisma } from '@/lib/prisma';
import EditPurchaseForm from './edit-form';
import { notFound } from 'next/navigation';

export default async function EditPurchasePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);
    const purchase = await prisma.purchase.findUnique({
        where: { id },
        include: { material: true }
    });

    if (!purchase) {
        notFound();
    }

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6">Edit Purchase</h1>
            <EditPurchaseForm purchase={purchase} material={purchase.material} />
        </div>
    );
}
