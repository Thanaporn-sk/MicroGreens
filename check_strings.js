const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const materials = await prisma.material.findMany();
    console.log('Materials:', materials.map(m => m.name));

    const lots = await prisma.plantingLot.findMany();
    console.log('Lots CropTypes:', lots.map(l => l.cropType));
}

check()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
