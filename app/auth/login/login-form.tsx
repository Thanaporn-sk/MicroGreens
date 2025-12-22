'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions';

export default function LoginForm() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <form action={dispatch} className="flex flex-col gap-4 p-6 border rounded-lg shadow-md bg-white w-full max-w-sm">
            <h1 className="text-2xl font-bold mb-4 text-center">Microgreens Platform</h1>
            <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                    type="email"
                    name="email"
                    required
                    className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="admin@example.com"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                    type="password"
                    name="password"
                    required
                    className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••"
                />
            </div>
            <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
                {errorMessage && (
                    <p className="text-red-500 text-sm">{errorMessage}</p>
                )}
            </div>
            <LoginButton />
        </form>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <button
            aria-disabled={pending}
            disabled={pending}
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 w-full transition-colors disabled:bg-blue-300"
        >
            {pending ? 'Logging in...' : 'Login'}
        </button>
    );
}
