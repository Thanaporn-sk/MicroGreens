'use client';

import * as React from 'react';
import { Moon, Sun, Check } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // useEffect only runs on the client, so now we can safely show the UI
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-9 h-9" />; // Placeholder to prevent hydration mismatch
    }

    return (
        <div className="relative group">
            <button
                className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle Theme"
            >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-700" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-100" />
            </button>

            {/* Simple Dropdown on Hover */}
            <div className="absolute left-0 bottom-full mb-2 w-32 bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-800 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-50 overflow-hidden">
                <button
                    onClick={() => setTheme("light")}
                    className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${theme === 'light' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-200'}`}
                >
                    <Sun className="w-4 h-4 mr-2" /> Light
                    {theme === 'light' && <Check className="w-3 h-3 ml-auto" />}
                </button>
                <button
                    onClick={() => setTheme("dark")}
                    className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${theme === 'dark' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-200'}`}
                >
                    <Moon className="w-4 h-4 mr-2" /> Dark
                    {theme === 'dark' && <Check className="w-3 h-3 ml-auto" />}
                </button>
                <button
                    onClick={() => setTheme("system")}
                    className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${theme === 'system' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-200'}`}
                >
                    <span className="w-4 h-4 mr-2 flex justify-center items-center font-bold text-xs">A</span> System
                    {theme === 'system' && <Check className="w-3 h-3 ml-auto" />}
                </button>
            </div>
        </div>
    );
}
