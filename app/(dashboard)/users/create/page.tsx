
import { createUser } from '@/app/lib/actions-user';
import Link from 'next/link';

export default function CreateUserPage() {
    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Create New User</h1>
                <Link href="/users" className="text-sm text-blue-600 hover:underline">
                    &larr; Back to Users
                </Link>
            </div>

            <form action={createUser} className="bg-white p-8 rounded-lg shadow border space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        required
                        className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
                    <input
                        type="password"
                        name="password"
                        required
                        minLength={6}
                        className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Role</label>
                    <select
                        name="role"
                        required
                        className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        defaultValue="STAFF"
                    >
                        <option value="STAFF">Staff</option>
                        <option value="ADMIN">Admin</option>
                        <option value="VIEWER">Viewer</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors mt-4 font-medium"
                >
                    Create User
                </button>
            </form>
        </div>
    );
}
