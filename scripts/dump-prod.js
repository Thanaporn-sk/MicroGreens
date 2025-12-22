const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

async function main() {
    console.log('🔄 DUMPING FULL PROD DB...');

    const prodEnvConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '../.env.prod')));
    const prodDbUrl = prodEnvConfig.DATABASE_URL;

    const prisma = new PrismaClient({
        datasources: { db: { url: prodDbUrl } }
    });

    const data = {};

    try {
        // Independent Tables
        console.log('📦 Fetching Users...');
        data.User = await prisma.user.findMany();

        console.log('📦 Fetching Materials...');
        data.Material = await prisma.material.findMany();

        console.log('📦 Fetching Customers...');
        data.Customer = await prisma.customer.findMany();

        console.log('📦 Fetching PlantingLots...');
        data.PlantingLot = await prisma.plantingLot.findMany();

        console.log('📦 Fetching ActivityLogs...');
        data.ActivityLog = await prisma.activityLog.findMany();

        // Dependent Tables
        console.log('📦 Fetching Stocks...');
        data.Stock = await prisma.stock.findMany();

        console.log('📦 Fetching Purchases...');
        data.Purchase = await prisma.purchase.findMany();

        console.log('📦 Fetching StockAdjustments...');
        data.StockAdjustment = await prisma.stockAdjustment.findMany();

        console.log('📦 Fetching Harvests...');
        data.Harvest = await prisma.harvest.findMany();

        console.log('📦 Fetching Sales...');
        data.Sale = await prisma.sale.findMany();

        fs.writeFileSync(
            path.join(__dirname, 'prod_full_dump.json'),
            JSON.stringify(data, null, 2)
        );
        console.log('✅ Exported to prod_full_dump.json');

    } catch (e) {
        console.error('❌ Dump Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
