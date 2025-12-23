'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Sprout,
    Users,
    DollarSign,
    ClipboardList,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { ThemeToggle } from '@/app/ui/theme-toggle';

const links = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Purchases', href: '/purchases', icon: ShoppingCart },
    { name: 'Planting Lots', href: '/lots', icon: Sprout },
    { name: 'Sales', href: '/sales', icon: DollarSign },
    { name: 'Reports', href: '/reports', icon: ClipboardList },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'User Management', href: '/users', icon: Users },
];

export default function SideNav({ signOutAction }: { signOutAction: () => Promise<void> }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b md:hidden">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center text-white font-bold">M</div>
                    <span className="font-bold text-gray-900">MicroGreens</span>
                </Link>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Container - Hidden on mobile unless open, Fixed on Desktop */}
            <div className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 transform transition-transform duration-200 ease-in-out
                md:translate-x-0 md:static md:h-screen
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex h-full flex-col px-3 py-4 md:px-2">
                    <Link className="mb-2 hidden h-20 items-end justify-start rounded-md bg-green-600 p-4 md:flex md:h-40" href="/">
                        <div className="w-32 text-white md:w-40">
                            <span className="text-xl font-bold">MicroGreens</span>
                        </div>
                    </Link>

                    <div className="flex grow flex-col justify-between space-y-2">
                        <div className="space-y-1">
                            {links.map((link) => {
                                const LinkIcon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors
                                            ${isActive
                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400'
                                            }
                                        `}
                                    >
                                        <LinkIcon className="w-5 h-5" />
                                        <span>{link.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="space-y-1">
                            <div className="px-3 py-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Theme</span>
                                <div className="flex items-center gap-3">
                                    <ThemeToggle />
                                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Appearance</span>
                                </div>
                            </div>
                        </div>

                        <form action={signOutAction}>
                            <button className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                <LogOut className="w-5 h-5" />
                                <span>Sign Out</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile when sidebar is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
