const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Use default initialization which picks up .env automatically (like check-status.js)
const prisma = new PrismaClient();

async function main() {
    console.log('🔄 LOADING INTO DEV (Standard Client)...');

    try {
        const dataPath = path.join(__dirname, 'prod_materials.json');
        if (!fs.existsSync(dataPath)) {
            throw new Error('prod_materials.json not found!');
        }
        const materials = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        console.log(`📂 Loaded ${materials.length} materials from file.`);

        for (const m of materials) {
            process.stdout.write(`   Upserting "${m.name}"... `);

            // Note: Upsert needs unique constraint. 'name' is unique in schema.
            await prisma.material.upsert({
                where: { name: m.name },
                update: { unit: m.unit },
                create: { name: m.name, unit: m.unit }
            });
            console.log('✅');
        }

    } catch (e) {
        console.error('\n❌ Load Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
