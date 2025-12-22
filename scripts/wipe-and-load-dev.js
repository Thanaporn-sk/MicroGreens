const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

async function main() {
    console.log('☢️  WIPING & LOADING DEV DB...');

    const devEnvConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '../.env')));
    let devDbUrl = devEnvConfig.DATABASE_URL;
    console.log(`🔌 URL: ${devDbUrl.replace(/:[^:]+@/, ':******@')}`);

    const client = new Client({
        connectionString: devDbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // 1. WIPE DATA
        console.log('🧹 Truncating tables...');
        try {
            // Truncate all tables. Order doesn't strict matter with CASCADE, but good for clarity.
            await client.query(`
                TRUNCATE TABLE 
                    "User", "Material", "Customer", "PlantingLot", "ActivityLog", 
                    "Stock", "Purchase", "StockAdjustment", "Harvest", "Sale"
                RESTART IDENTITY CASCADE;
            `);
            console.log('✅ Tables Wiped.');
        } catch (e) {
            console.warn('⚠️  Truncate warning (might be empty):', e.message);
        }

        // 2. LOAD DATA
        const dataPath = path.join(__dirname, 'prod_full_dump.json');
        if (!fs.existsSync(dataPath)) throw new Error('File not found');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        const insertTable = async (tableName, rows) => {
            if (!rows || rows.length === 0) return;
            console.log(`\n📂 Inserting ${tableName} (${rows.length} rows)...`);

            for (const row of rows) {
                const keys = Object.keys(row).map(k => `"${k}"`).join(', ');
                const values = Object.values(row);
                const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

                const query = `INSERT INTO "${tableName}" (${keys}) VALUES (${placeholders})`;

                try {
                    await client.query(query, values);
                } catch (e) {
                    console.error(`❌ Failed insert ${tableName}:`, e.message);
                }
            }
        };

        // Order matters for Foreign Keys!
        // Level 0
        await insertTable('User', data.User);
        await insertTable('Material', data.Material);
        await insertTable('Customer', data.Customer);
        await insertTable('PlantingLot', data.PlantingLot);

        // Level 1
        await insertTable('ActivityLog', data.ActivityLog); // Mostly independent usually
        await insertTable('Stock', data.Stock);
        await insertTable('Purchase', data.Purchase);
        await insertTable('StockAdjustment', data.StockAdjustment);
        await insertTable('Harvest', data.Harvest);
        await insertTable('Sale', data.Sale);

        console.log('\n✨ Reset & Sync Completed!');

    } catch (e) {
        console.error('❌ Failed:', e);
    } finally {
        await client.end();
    }
}

main();
