'use server';

import { prisma } from '@/lib/prisma';

export interface HistoryItem {
    id: string; // Composite ID
    type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'HARVEST';
    date: Date;
    quantity: number;
    details: string; // Cost, Price, Reason, or Lot Code
}

export async function getItemHistory(materialId: number) {
    const material = await prisma.material.findUnique({ where: { id: materialId } });
    if (!material) return { history: [] };

    // 1. Purchases
    const purchases = await prisma.purchase.findMany({
        where: { materialId },
        include: { material: true }
    });

    // 2. Adjustments
    const adjustments = await prisma.stockAdjustment.findMany({
        where: { materialId }
    });

    // 3. Harvests (Items harvested into this material)
    // 3. Harvests (Items harvested into this material)
    // Fetch all harvests to perform flexible matching for legacy data where materialId might be null
    const allHarvests = await prisma.harvest.findMany({
        include: { lot: true }
    });

    const harvests = allHarvests.filter(h => {
        if (h.materialId === materialId) return true;
        if (!h.lot.cropType) return false;

        // Flexible matching: normalize spaces and case
        const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '');
        const matName = normalize(material.name);
        const cropName = normalize(h.lot.cropType); // "Sun Flower" -> "sunflower"

        // Check mutual inclusion
        return matName.includes(cropName) || cropName.includes(matName);
    });

    // 4. Sales (Items sold with this material name)
    // Note: Sales are loosely linked by name currently
    const sales = await prisma.sale.findMany({
        where: { productName: material.name },
        include: { customer: true }
    });

    const history: HistoryItem[] = [];

    purchases.forEach(p => {
        history.push({
            id: `p-${p.id}`,
            type: 'PURCHASE',
            date: p.date,
            quantity: p.quantity,
            details: `Cost: $${p.cost?.toFixed(2)}`
        });
    });

    adjustments.forEach(a => {
        history.push({
            id: `a-${a.id}`,
            type: 'ADJUSTMENT',
            date: a.date,
            quantity: a.quantity,
            details: a.reason
        });
    });

    harvests.forEach(h => {
        history.push({
            id: `h-${h.id}`,
            type: 'HARVEST',
            date: h.harvestDate,
            quantity: h.weight, // Harvest weight adds to stock
            details: `Lot: ${h.lot.lotCode}`
        });
    });

    sales.forEach(s => {
        history.push({
            id: `s-${s.id}`,
            type: 'SALE',
            date: s.saleDate,
            quantity: -s.weight, // Sales reduce stock
            details: `Sold to: ${s.customer?.name || 'Unknown'} ($${s.price.toFixed(2)})`
        });
    });

    // Sort by date desc
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { history };
}

export async function getProductSalesHistory(productName: string) {
    const sales = await prisma.sale.findMany({
        where: { productName },
        orderBy: { saleDate: 'desc' },
        include: { customer: true }
    });
    return sales;
}

export async function getCustomerHistory(customerId: number) {
    const sales = await prisma.sale.findMany({
        where: { customerId },
        orderBy: { saleDate: 'desc' },
    });
    return sales;
}
