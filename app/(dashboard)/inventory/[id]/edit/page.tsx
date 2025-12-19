
import { prisma } from '@/lib/prisma';
import EditMaterialForm from './edit-form';
import { notFound } from 'next/navigation';

export default async function EditMaterialPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);
    const material = await prisma.material.findUnique({ where: { id } });

    if (!material) {
        notFound();
    }

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6">Edit Material</h1>
            <EditMaterialForm material={material} />
        </div>
    );
}
