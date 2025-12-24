'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    pendingText?: string;
}

export function SubmitButton({ children, className, pendingText = 'Saving...', disabled, ...props }: SubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending || disabled}
            className={`flex items-center justify-center gap-2 transition-all ${className} ${pending ? 'opacity-70 cursor-not-allowed' : ''}`}
            {...props}
        >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            {pending ? pendingText : children}
        </button>
    );
}
