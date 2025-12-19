'use client';

import { Trash2 } from 'lucide-react';

type DeleteButtonProps = {
    id: number | string;
    deleteAction: (id: any) => Promise<void>; // Relaxing type here to allow both number and string actions
};

export default function DeleteButton({ id, deleteAction }: DeleteButtonProps) {
    return (
        <form action={async () => {
            // if (confirm('Are you sure you want to delete this item?')) {
            await deleteAction(id);
            // }
        }}>
            <button type="submit" className="text-red-600 hover:text-red-800 transition-colors p-1">
                <Trash2 className="w-4 h-4" />
            </button>
        </form>
    );
}
