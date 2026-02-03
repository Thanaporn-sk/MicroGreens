
const { Client } = require('pg');

const sourceConfig = {
    connectionString: "postgresql://postgres.xgwokqgdwmdwuukgawvd:mTrBBRnPSRaDagLW@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true",
    ssl: { rejectUnauthorized: false }
};
const targetConfig = {
    connectionString: "postgresql://postgres.pbnvpdvjtdufjihyeczu:4Bxzu7THj3L1G54h@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true",
    ssl: { rejectUnauthorized: false }
};

const tables = [
    'User',
    'Customer',
    'Material',
    'Stock',
    'Purchase',
    'PlantingLot',
    'LotEvent',
    'Harvest',
    'Sale',
    'StockAdjustment',
    'MaterialImage',
    'LotImage',
    'ActivityLog'
];

// Delete order: Child -> Parent
const deleteOrder = [
    'LotImage', 'MaterialImage', 'StockAdjustment', 'Sale', 'Harvest', 'LotEvent',
    'PlantingLot', 'Purchase', 'Stock', 'Material', 'Customer', 'ActivityLog', 'User'
];

async function main() {
    console.log('Syncing Production -> Dev...');
    const source = new Client(sourceConfig);
    const target = new Client(targetConfig);

    try {
        await source.connect();
        console.log('Connected to Source (Prod)');
        await target.connect();
        console.log('Connected to Target (Dev)');

        // 1. Clear Target
        console.log('Clearing Target Database...');
        for (const table of deleteOrder) {
            try {
                await target.query(`DELETE FROM "${table}"`);
                console.log(`  Deleted ${table}`);
            } catch (e) {
                console.log(`  Failed to delete ${table}: ${e.message}`);
            }
        }

        // 2. Transfer Data
        console.log('Transferring Data...');
        for (const table of tables) {
            console.log(`  Syncing ${table}...`);
            const res = await source.query(`SELECT * FROM "${table}"`);
            const rows = res.rows;

            if (rows.length === 0) {
                console.log(`    No rows involved.`);
                continue;
            }

            console.log(`    Found ${rows.length} rows.`);

            for (const row of rows) {
                const keys = Object.keys(row).map(k => `"${k}"`).join(', ');
                const values = Object.values(row);
                const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

                const query = `INSERT INTO "${table}" (${keys}) VALUES (${placeholders})`;
                try {
                    await target.query(query, values);
                } catch (e) {
                    console.error(`    Insert Failed for ${table} ID ${row.id}: ${e.message}`);
                }
            }
        }

        console.log('Sync Complete!');

    } catch (e) {
        console.error('FATAL ERROR:', e.message, e.stack);
    } finally {
        await source.end();
        await target.end();
    }
}

main();
