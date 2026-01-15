
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Attempting to create a planting lot...");
    try {
        const result = await prisma.plantingLot.create({
            data: {
                lotCode: 'TEST-LOT-DEBUG-001',
                cropType: 'Radish',
                seedUsed: 50.0,
                trayCount: 10,
                plantingDate: new Date(),
                // expectedHarvestDate: null, // Optional
                notes: 'Debug test'
            }
        });
        console.log("Success:", result);
    } catch (e) {
        console.error("Error creating planting lot:");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
