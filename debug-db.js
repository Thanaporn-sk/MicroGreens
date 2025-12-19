const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('Attempting to connect...');
    // Log masked DB URL if possible (safe?) - actually just relying on prisma to work
    try {
        await prisma.$connect();
        console.log('Connection successful!');

        const materials = await prisma.material.findMany();
        console.log(`Found ${materials.length} materials:`);
        materials.forEach(m => {
            console.log(`- [${m.id}] "${m.name}" (${m.unit})`);
        });

    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
