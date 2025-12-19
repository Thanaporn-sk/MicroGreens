import { prisma } from '@/lib/prisma';
import SaleForm from './sale-form';

export default async function NewSalePage() {
    const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } });
    const materials = await prisma.material.findMany({
        include: { stock: true },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6">Record New Sale</h1>
            <SaleForm customers={customers} materials={materials} />
        </div>
    );
}
