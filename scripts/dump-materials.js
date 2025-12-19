const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
    console.log('DB URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'Undefined');
    const materials = await prisma.material.findMany();

    console.log('Materials found:', materials.length);
    console.log(JSON.stringify(materials, null, 2));

    let output = 'ID,Name,Unit,NameLength,Hex\n';
    materials.forEach(m => {
        // Show hex representation of name to catch hidden chars
        const hex = Buffer.from(m.name).toString('hex');
        output += `${m.id},"${m.name}",${m.unit},${m.name.length},${hex}\n`;
    });

    fs.writeFileSync('material_dump.csv', output);
    console.log('Dumped materials to material_dump.csv');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
