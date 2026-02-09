
import { prisma } from '../lib/prisma';
import fs from 'fs';

async function main() {
    let output = '--- Debugging Data ---\n';

    try {
        // Check Active Lots
        const activeLots = await prisma.plantingLot.findMany({
            where: {
                status: { in: ['PLANTED', 'HARVESTING'] }
            },
            select: { id: true, lotCode: true, plantingDate: true, expectedHarvestDate: true, status: true }
        });
        output += `Active Lots Found: ${activeLots.length}\n`;
        activeLots.forEach(l => {
            output += `  Lot: ${l.lotCode}, Status: ${l.status}, Plant: ${l.plantingDate ? l.plantingDate.toISOString() : 'null'}, Harvest: ${l.expectedHarvestDate ? l.expectedHarvestDate.toISOString() : 'null'}\n`;
        });

        // Check Harvests
        const start = new Date('2026-01-25');
        const end = new Date('2026-02-28');

        const harvests = await prisma.harvest.findMany({
            where: {
                harvestDate: {
                    gte: start,
                    lte: end
                }
            }
        });
        output += `Harvests Found in range: ${harvests.length}\n`;
        harvests.slice(0, 5).forEach(h => output += `  Harvest: ${h.harvestDate.toISOString()}, Qty: ${h.weight}kg\n`);

        // Check Sales
        const sales = await prisma.sale.findMany({
            where: {
                saleDate: {
                    gte: start,
                    lte: end
                }
            }
        });
        output += `Sales Found in range: ${sales.length}\n`;
        sales.slice(0, 5).forEach(s => output += `  Sale: ${s.saleDate.toISOString()}, Price: ${s.price}\n`);
    } catch (e: any) {
        output += `Error: ${e.message}\n${e.stack}\n`;
    }

    fs.writeFileSync('debug_output.txt', output);
    console.log('Output written to debug_output.txt');
}

main()
    .catch(e => {
        fs.writeFileSync('debug_output_error.txt', String(e));
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
