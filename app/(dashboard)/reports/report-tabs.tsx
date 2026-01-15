'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ReportTabs() {
    const pathname = usePathname();

    const tabs = [
        { name: 'Financial', href: '/reports' },
        { name: 'Inventory', href: '/reports/inventory' },
    ];

    return (
        <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 mb-6">
            {tabs.map((tab) => {
                const isActive = tab.href === '/reports'
                    ? pathname === '/reports'
                    : pathname.startsWith(tab.href);

                return (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={`
                            px-4 py-2 text-sm font-medium border-b-2 transition-colors
                            ${isActive
                                ? 'border-green-600 text-green-600 dark:text-green-400 dark:border-green-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }
                        `}
                    >
                        {tab.name}
                    </Link>
                );
            })}
        </div>
    );
}
