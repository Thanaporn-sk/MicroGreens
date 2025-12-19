const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    if (!fs.existsSync('users_backup.json')) {
        console.error('Backup file users_backup.json not found!');
        process.exit(1);
    }

    const users = JSON.parse(fs.readFileSync('users_backup.json', 'utf8'));
    console.log(`Restoring ${users.length} users...`);

    for (const user of users) {
        // Use upsert to avoid conflicts if seed ran
        await prisma.user.upsert({
            where: { email: user.email },
            update: {
                password: user.password,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            create: {
                id: user.id, // Keep original ID
                email: user.email,
                password: user.password,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    }
    console.log('Restore complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
