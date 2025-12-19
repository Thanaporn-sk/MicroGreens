const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🔍 Reading .env.prod...');
    const envPath = path.join(__dirname, '../.env.prod');
    const envContent = fs.readFileSync(envPath, 'utf8');

    // Simple parse for DATABASE_URL
    const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
    if (!match) {
        console.error('❌ Could not find DATABASE_URL in .env.prod');
        process.exit(1);
    }

    const dbUrl = match[1];
    console.log(`🔌 Connecting to Production DB (Host: ${dbUrl.split('@')[1].split(':')[0]})...`);

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: dbUrl,
            },
        },
    });

    try {
        console.log('📊 Checking Tables...');
        const userCount = await prisma.user.count();
        console.log(`✅ User Table: OK (Records: ${userCount})`);

        const matCount = await prisma.material.count();
        console.log(`✅ Material Table: OK (Records: ${matCount})`);

        if (userCount === 0) {
            console.log('⚠️  Production DB is empty (No users). You may need to run seed script or sign up.');
        } else {
            console.log('🚀 Production DB looks ready!');
        }

    } catch (e) {
        if (e.code === 'P2021') {
            console.error('❌ Table missing. Migration failed or not run yet.');
        } else {
            console.error('❌ Error querying database:', e.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
