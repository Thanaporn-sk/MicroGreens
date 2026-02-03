import Link from 'next/link';
import { signOut, auth } from '@/auth';
import SideNav from '@/app/ui/dashboard/sidenav';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const userName = session?.user?.name || 'User';

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-gray-50 dark:bg-gray-950">
            <SideNav
                userName={userName}
                signOutAction={async () => {
                    'use server';
                    await signOut();
                }}
            />
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
                {children}
            </div>
        </div>
    );
}
