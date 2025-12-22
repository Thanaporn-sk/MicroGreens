const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('📊 Verifying Local Data Counts...');

    // Check key tables
    const users = await prisma.user.count();
    const mats = await prisma.material.count();
    const custs = await prisma.customer.count();
    const lots = await prisma.plantingLot.count();
    const harvests = await prisma.harvest.count();
    const sales = await prisma.sale.count();
    const purchases = await prisma.purchase.count();

    console.log('---------------------------');
    console.log(`User:         ${users} (Exp: 1)`);
    console.log(`Material:     ${mats} (Exp: 4)`); // Was 5 before wipe (1 local + 4 prod). Now should match Prod exactly (4)
    console.log(`Customer:     ${custs} (Exp: 4)`);
    console.log(`PlantingLot:  ${lots} (Exp: 7)`);
    console.log(`Harvest:      ${harvests} (Exp: 4)`);
    console.log(`Sale:         ${sales} (Exp: 0)`);
    console.log(`Purchase:     ${purchases} (Exp: 3)`);
    console.log('---------------------------');
}

main().finally(() => prisma.$disconnect());
