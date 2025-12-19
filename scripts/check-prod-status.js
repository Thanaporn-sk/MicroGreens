const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking database status...');
    try {
        // Check User table
        const userCount = await prisma.user.count();
        console.log(`✅ User Table: Access OK. Record count: ${userCount}`);
        if (userCount === 0) {
            console.log('⚠️ WARNING: No users found. Login will be impossible.');
        }
    } catch (e) {
        if (e.code === 'P2021') {
            console.error('❌ User Table: MISSING (Table does not exist). App will CRASH.');
        } else {
            console.error('❌ User Table Error:', e.message);
        }
    }

    try {
        // Check Material table
        const matCount = await prisma.material.count();
        console.log(`✅ Material Table: Access OK. Record count: ${matCount}`);
    } catch (e) {
        if (e.code === 'P2021') {
            console.error('❌ Material Table: MISSING (Table does not exist).');
        } else {
            console.error('❌ Material Table Error:', e.message);
        }
    }
}

main()
    .finally(async () => await prisma.$disconnect());
