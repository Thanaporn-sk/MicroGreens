
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Cleaning up debug lot...");
    try {
        const deleted = await prisma.plantingLot.deleteMany({
            where: {
                lotCode: { in: ['TEST-LOT-DEBUG-001', 'TEST-LOT-FIX-001', 'TEST-LOT-UI-SUCCESS'] }
            }
        });
        console.log(`Deleted ${deleted.count} debug lots.`);
    } catch (e) {
        console.error("Error cleaning up:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
