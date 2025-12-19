const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    console.log('Backing up users...');
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);

    if (users.length > 0) {
        fs.writeFileSync('users_backup.json', JSON.stringify(users, null, 2));
        console.log('Backup saved to users_backup.json');
    } else {
        console.warn('No users found to backup!');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
