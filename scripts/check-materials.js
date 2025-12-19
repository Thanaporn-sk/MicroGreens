const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking for duplicates...');
    const materials = await prisma.material.findMany({
        include: {
            stock: true,
            _count: {
                select: {
                    purchases: true,
                    harvests: true,
                    adjustments: true
                }
            }
        }
    });

    const seen = {};
    const duplicates = [];

    for (const m of materials) {
        // Normalize name to catch " Name" vs "Name " issues
        const normalizedName = m.name.trim();
        const key = `${normalizedName}-${m.unit}`;

        console.log(`Checking: "${m.name}" -> "${normalizedName}" (Unit: ${m.unit})`); // DEBUG

        if (seen[key]) {
            duplicates.push({
                original: seen[key],
                duplicate: m
            });
        } else {
            seen[key] = m;
        }
    }

    if (duplicates.length === 0) {
        console.log('No duplicates found.');
    } else {
        console.log(`Found ${duplicates.length} duplicate sets:`);
        duplicates.forEach(d => {
            console.log('--------------------------------------------------');
            console.log(`Duplicate Set for: "${d.original.name}" (${d.original.unit})`);
            console.log('KEEPING (First seen):');
            console.log(`  ID: ${d.original.id}, Created: ${d.original.createdAt}`);
            console.log(`  Usage: Stock=${d.original.stock?.quantity ?? 'None'}, Purchases=${d.original._count.purchases}, Harvests=${d.original._count.harvests}`);

            console.log('REMOVING (Duplicate):');
            console.log(`  ID: ${d.duplicate.id}, Created: ${d.duplicate.createdAt}`);
            console.log(`  Usage: Stock=${d.duplicate.stock?.quantity ?? 'None'}, Purchases=${d.duplicate._count.purchases}, Harvests=${d.duplicate._count.harvests}`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
