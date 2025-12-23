
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus, Pencil } from 'lucide-react';
import DeleteButton from '@/app/ui/delete-button';
import { deleteUser } from '@/app/lib/actions-user';
import Search from '@/app/ui/search';

export default async function UsersPage(props: {
    searchParams?: Promise<{
        query?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { email: { contains: query } },
            ]
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">User Management</h1>
                <Link
                    href="/users/create"
                    className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    New User
                </Link>
            </div>

            <div className="mb-4">
                <Search placeholder="Search users by name or email..." />
            </div>

            <div className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No users found.</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{user.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300' :
                                            user.role === 'STAFF' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                        <Link href={`/users/${user.id}/edit`} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1">
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <DeleteButton id={user.id} deleteAction={deleteUser} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
