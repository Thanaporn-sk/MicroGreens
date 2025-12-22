const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

async function main() {
    console.log('🔄 Starting Data Sync: PROD -> DEV');

    // 1. Load PROD Environment
    const prodEnvConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '../.env.prod')));
    const prodDbUrl = prodEnvConfig.DATABASE_URL;

    // 2. Load DEV Environment (Local .env)
    const devEnvConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '../.env')));
    const devDbUrl = devEnvConfig.DATABASE_URL;

    console.log(`🔌 Prod DB: ...${prodDbUrl.split('@')[1]}`);
    console.log(`🔌 Dev DB:  ...${devDbUrl.split('@')[1]}`);

    // 3. Connect to PROD & Fetch
    console.log('🔌 Connecting to PROD...');
    const prismaProd = new PrismaClient({
        datasources: { db: { url: prodDbUrl } }
    });

    let materials = [];
    try {
        console.log('📥 Fetching Materials from PROD...');
        materials = await prismaProd.material.findMany();
        console.log(`   Found ${materials.length} materials.`);
    } finally {
        await prismaProd.$disconnect();
        console.log('🔌 Disconnected from PROD.');
    }

    // 4. Connect to DEV & Insert
    console.log('🔌 Connecting to DEV...');
    const prismaDev = new PrismaClient({
        datasources: { db: { url: devDbUrl } }
    });

    try {
        console.log('📤 Upserting to DEV...');
        for (const m of materials) {
            process.stdout.write(`   Processing "${m.name}"... `);
            const { id, ...data } = m;

            await prismaDev.material.upsert({
                where: { name: m.name },
                update: { unit: m.unit },
                create: { name: m.name, unit: m.unit }
            });
            console.log('✅');
        }
        console.log('✨ Sync Completed!');

    } catch (e) {
        console.error('\n❌ Sync Failed:', e);
    } finally {
        await prismaDev.$disconnect();
    }
}

main();
