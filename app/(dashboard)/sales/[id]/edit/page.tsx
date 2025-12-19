import { prisma } from '@/lib/prisma';
import EditSaleForm from './edit-form';
import { notFound } from 'next/navigation';

export default async function EditSalePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);
    const sale = await prisma.sale.findUnique({ where: { id } });

    if (!sale) {
        notFound();
    }

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6">Edit Sale</h1>
            <EditSaleForm sale={sale} />
        </div>
    );
}
