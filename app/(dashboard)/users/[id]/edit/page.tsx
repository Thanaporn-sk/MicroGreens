
import { updateUser, updateUserPassword } from '@/app/lib/actions-user';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function EditUserPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const user = await prisma.user.findUnique({ where: { id: params.id } });

    if (!user) return <div>User not found</div>;

    const updateUserWithId = updateUser.bind(null, user.id);
    const updatePasswordWithId = updateUserPassword.bind(null, user.id);

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Edit User</h1>
                <Link href="/users" className="text-sm text-blue-600 hover:underline">
                    &larr; Back to Users
                </Link>
            </div>

            {/* Edit Details Form */}
            <div className="bg-white p-8 rounded-lg shadow border">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">User Details</h2>
                <form action={updateUserWithId} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={user.name || ''}
                            className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            defaultValue={user.email}
                            required
                            className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Role</label>
                        <select
                            name="role"
                            defaultValue={user.role}
                            className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="STAFF">Staff</option>
                            <option value="ADMIN">Admin</option>
                            <option value="VIEWER">Viewer</option>
                        </select>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            Save Details
                        </button>
                    </div>
                </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-white p-8 rounded-lg shadow border">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Reset Password</h2>
                <form action={updatePasswordWithId} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">New Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            minLength={6}
                            placeholder="Enter new password"
                            className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
                        >
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
