
import { prisma } from '@/lib/prisma';
import EditCustomerForm from './edit-form';
import { notFound } from 'next/navigation';

export default async function EditCustomerPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);
    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer) {
        notFound();
    }

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6">Edit Customer</h1>
            <EditCustomerForm customer={customer} />
        </div>
    );
}
