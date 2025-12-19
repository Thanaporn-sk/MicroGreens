const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🔍 Reading .env.prod for DB connection...');
    const envPath = path.join(__dirname, '../.env.prod');
    const envContent = fs.readFileSync(envPath, 'utf8');

    // Simple parse for DATABASE_URL
    const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
    if (!match) {
        console.error('❌ Could not find DATABASE_URL in .env.prod');
        process.exit(1);
    }
    const dbUrl = match[1];

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: dbUrl,
            },
        },
    });

    try {
        console.log('📦 Fetching Materials from Production...');
        const materials = await prisma.material.findMany({
            orderBy: { name: 'asc' }
        });

        if (materials.length === 0) {
            console.log('⚠️ No materials found.');
        } else {
            console.log(`✅ Found ${materials.length} materials:`);
            materials.forEach(m => {
                console.log(`- [${m.id}] "${m.name}" (${m.unit})`);
            });
        }

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
