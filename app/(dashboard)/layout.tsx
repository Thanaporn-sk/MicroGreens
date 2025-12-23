import Link from 'next/link';
import { signOut } from '@/auth';
import SideNav from '@/app/ui/dashboard/sidenav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-gray-50 dark:bg-gray-950">
            <SideNav
                signOutAction={async () => {
                    'use server';
                    await signOut();
                }}
            />
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12 overflow-x-hidden">
                {children}
            </div>
        </div>
    );
}
