'use client';

import { Trash2, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

type DeleteButtonProps = {
    id: number | string;
    deleteAction: (id: any) => Promise<void>;
};

function DeleteSubmit() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className={`text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 transition-colors p-1 ${pending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
    );
}

export default function DeleteButton({ id, deleteAction }: DeleteButtonProps) {
    return (
        <form action={async () => {
            await deleteAction(id);
        }}>
            <DeleteSubmit />
        </form>
    );
}
