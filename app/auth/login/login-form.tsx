'use client';

import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { SubmitButton } from '@/app/ui/submit-button';

export default function LoginForm() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <form action={dispatch} className="flex flex-col gap-4 p-6 border dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800 w-full max-w-sm">
            <h1 className="text-2xl font-bold mb-4 text-center dark:text-white">Microgreens Platform</h1>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Email</label>
                <input
                    type="email"
                    name="email"
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="admin@example.com"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Password</label>
                <input
                    type="password"
                    name="password"
                    required
                    className="border border-gray-300 dark:border-gray-700 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="••••••"
                />
            </div>
            <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
                {errorMessage && (
                    <p className="text-red-500 text-sm">{errorMessage}</p>
                )}
            </div>
            <SubmitButton pendingText="Logging in..." className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 w-full transition-colors disabled:bg-blue-300">
                Login
            </SubmitButton>
        </form>
    );
}
