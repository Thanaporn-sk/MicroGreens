'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut, Sun, Moon, Monitor, ChevronDown, User } from 'lucide-react';
import { useTheme } from 'next-themes';

interface UserMenuProps {
    userName: string;
    signOutAction: () => Promise<void>;
}

export function UserMenu({ userName, signOutAction }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative border-t dark:border-gray-800 pt-4 mt-auto" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <User className="w-4 h-4 text-green-700 dark:text-green-400" />
                    </div>
                    <span className="truncate max-w-[120px]">{userName}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu - Upwards */}
            {isOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-md shadow-lg overflow-hidden py-1 z-50">

                    {/* Theme Switcher Section */}
                    <div className="px-3 py-2 border-b dark:border-gray-800">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Theme</p>
                        <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
                            <button
                                onClick={() => setTheme('light')}
                                className={`flex items-center justify-center p-1.5 rounded-sm transition-all ${theme === 'light' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                                    }`}
                                title="Light Mode"
                            >
                                <Sun className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`flex items-center justify-center p-1.5 rounded-sm transition-all ${theme === 'dark' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                                    }`}
                                title="Dark Mode"
                            >
                                <Moon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setTheme('system')}
                                className={`flex items-center justify-center p-1.5 rounded-sm transition-all ${theme === 'system' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                                    }`}
                                title="System"
                            >
                                <Monitor className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Logout Section */}
                    <div className="p-1">
                        <form action={async () => {
                            await signOutAction();
                        }}>
                            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
