'use server';

import { prisma } from '@/lib/prisma';
import { getLocalISODate } from '@/app/lib/formatters';

export async function getActiveLotsForWeather() {
    const lots = await prisma.plantingLot.findMany({
        where: {
            status: { in: ['PLANTED', 'HARVESTING'] }
        },
        select: {
            id: true,
            lotCode: true,
            cropType: true,
            trayCount: true,
            seedUsed: true,
            plantingDate: true,
            expectedHarvestDate: true,
            status: true
        }
    });

    return lots.map(lot => ({
        ...lot,
        plantingDate: lot.plantingDate.toISOString(),
        expectedHarvestDate: lot.expectedHarvestDate ? lot.expectedHarvestDate.toISOString() : null
    }));
}

export async function getDailySalesData(startDate?: Date, endDate?: Date) {
    // Default to strict 2026 range if not provided (fallback)
    const start = startDate || new Date('2026-01-25');
    const end = endDate || new Date('2026-02-28');

    const sales = await prisma.sale.groupBy({
        by: ['saleDate'],
        _sum: {
            price: true,
        },
        where: {
            saleDate: {
                gte: start,
                lte: end
            }
        },
        orderBy: {
            saleDate: 'asc',
        },
    });

    return sales.map(sale => ({
        date: sale.saleDate.toISOString().split('T')[0],
        total: sale._sum.price || 0
    }));
}

export async function getDailyHarvestData(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date('2026-01-25');
    const end = endDate || new Date('2026-02-28');

    const harvests = await prisma.harvest.groupBy({
        by: ['harvestDate'],
        _sum: {
            weight: true,   // Total weight in kg
            bagCount: true, // Total bags harvested
        },
        where: {
            harvestDate: {
                gte: start,
                lte: end
            }
        },
        orderBy: {
            harvestDate: 'asc',
        },
    });

    return harvests.map(h => ({
        date: h.harvestDate.toISOString().split('T')[0],
        total: h._sum.weight || 0,
        bagCount: h._sum.bagCount || 0
    }));
}

export async function getRealTimeWeather() {
    const lat = 13.17; // Si Racha
    const long = 100.93;

    try {
        // Fetch 14 days history + 21 days forecast (approx 5 weeks total)
        // Request 16 days of forecast to stay within Open-Meteo free tier limits
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FBangkok&past_days=14&forecast_days=16`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!response.ok) {
            throw new Error('Weather API failed');
        }

        const data = await response.json();
        return data.daily;
    } catch (error) {
        console.error('Failed to fetch weather:', error);
        return null;
    }
}
