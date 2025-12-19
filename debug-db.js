const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('Attempting to connect...');
    try {
        await prisma.$connect();
        console.log('Connection successful!');
        const count = await prisma.user.count();
        console.log('User count:', count);
    } catch (e) {
        console.error('Connection failed:');
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
