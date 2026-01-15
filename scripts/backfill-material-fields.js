
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Backfilling Material fields...");
    try {
        const result = await prisma.material.updateMany({
            data: {
                type: 'MATERIAL',
                buySale: 'BUY' // Updated to 'BUY' per user request
            }
        });
        console.log(`Successfully updated ${result.count} materials.`);
    } catch (e) {
        console.error("Error backfilling materials:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
