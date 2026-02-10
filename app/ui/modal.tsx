'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Modal({
    isOpen,
    onClose,
    title,
    children
}: {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 pointer-events-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl relative flex flex-col max-h-[calc(100vh-2rem)] transition-colors overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
