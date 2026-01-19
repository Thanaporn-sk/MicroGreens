const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing sequences...');
    // Tables with auto-increment ID
    const tables = [
        'Material',
        'MaterialImage',
        'Stock',
        'Purchase',
        'PlantingLot',
        'LotEvent',
        'LotImage',
        'Harvest',
        'Customer',
        'Sale',
        'StockAdjustment',
        'ActivityLog'
    ];

    for (const table of tables) {
        try {
            // Using quote_ident approach via string interpolation for table name
            // The table name in Postgres defaults to the Model name (PascalCase) unless @@map is used.
            // Schema didn't have @@map. So "Material" is likely correct.
            // We use simple query with quotes.

            await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), coalesce(max(id)+1, 1), false) FROM "${table}";`);
            console.log(`✓ Updated sequence for ${table}`);
        } catch (error) {
            console.error(`x Failed to update sequence for ${table}:`, error.message);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
