'use client';

import { useState } from 'react';
import { LotTimeline } from './lot-features';
import LotHarvests from './lot-harvests';
import type { LotEvent, LotImage, Harvest, Material } from '@prisma/client';

type LotEventWithImages = LotEvent & { images: LotImage[] };
type HarvestWithMaterial = Harvest & { material: Material | null };

export default function LotDetailsTabs({
    lotId,
    events,
    harvests,
    orphanImages
}: {
    lotId: number,
    events: LotEventWithImages[],
    harvests: HarvestWithMaterial[],
    orphanImages: LotImage[] // Images not attached to any event
}) {
    const [activeTab, setActiveTab] = useState<'timeline' | 'harvests'>('timeline');

    return (
        <div>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'timeline'
                            ? 'border-green-500 text-green-600 dark:text-green-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        Timeline & Events
                    </button>
                    <button
                        onClick={() => setActiveTab('harvests')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'harvests'
                            ? 'border-green-500 text-green-600 dark:text-green-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        Harvests
                    </button>
                </nav>
            </div>

            {activeTab === 'timeline' && (
                <div className="space-y-6">
                    <LotTimeline lotId={lotId} events={events} />
                </div>
            )}

            {activeTab === 'harvests' && (
                <LotHarvests lotId={lotId} harvests={harvests} />
            )}
        </div>
    );
}
