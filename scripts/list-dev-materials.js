const { PrismaClient } = require('@prisma/client');

// Default to local env (dev)
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('📦 Fetching Materials from DEV (Local)...');
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
