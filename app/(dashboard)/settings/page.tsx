
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { updateUserSettings } from '@/app/lib/actions-user';
import { Settings as SettingsIcon } from 'lucide-react';

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) return null;

    const updateWithId = updateUserSettings.bind(null, user.id);

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <SettingsIcon className="w-8 h-8 text-green-600" />
                <h1 className="text-2xl font-bold">Settings</h1>
            </div>

            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-6 italic text-gray-900 dark:text-gray-100">Display Preferences</h2>

                <form action={updateWithId} className="space-y-6">
                    <div>
                        <label htmlFor="rowsPerPage" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Rows Per Page
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            How many rows to display in tables before paginating.
                        </p>
                        <select
                            id="rowsPerPage"
                            name="rowsPerPage"
                            defaultValue={(user as any).rowsPerPage || 25}
                            className="w-full md:w-48 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-2.5 text-sm focus:ring-2 focus:ring-green-500 transition-all outline-none dark:text-gray-200"
                        >
                            <option value="10">10 Rows</option>
                            <option value="25">25 Rows (Default)</option>
                            <option value="50">50 Rows</option>
                            <option value="100">100 Rows</option>
                        </select>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm"
                        >
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
