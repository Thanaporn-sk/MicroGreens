const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

async function main() {
    console.log('🔄 LOADING FULL DATA INTO DEV...');

    const devEnvConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '../.env')));
    let devDbUrl = devEnvConfig.DIRECT_URL || devEnvConfig.DATABASE_URL;
    // Force direct URL for South-1 to avoid pgbouncer issues
    if (devDbUrl.includes('south-1')) {
        devDbUrl = "postgresql://postgres.xgwokqgdwmdwuukgawvd:mTrBBRnPSRaDagLW@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";
    }

    const client = new Client({
        connectionString: devDbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const dataPath = path.join(__dirname, 'prod_full_dump.json');
        if (!fs.existsSync(dataPath)) throw new Error('File not found');

        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        // Helper to insert
        const insertTable = async (tableName, rows, conflictKey = 'id') => {
            if (!rows || rows.length === 0) return;
            console.log(`\n📂 Processing ${tableName} (${rows.length} rows)...`);

            for (const row of rows) {
                const keys = Object.keys(row).map(k => k === 'buySale' ? 'buy_sale' : k);
                const values = Object.values(row);

                const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
                const columns = keys.map(k => `"${k}"`).join(', '); // Quote identifiers

                const query = `
                    INSERT INTO "${tableName}" (${columns})
                    VALUES (${placeholders})
                    ON CONFLICT ("${conflictKey}") 
                    DO NOTHING; 
                `;

                try {
                    await client.query(query, values);
                    process.stdout.write('.');
                } catch (e) {
                    process.stdout.write('X');
                    console.error(`\nFailed ${tableName}:`, e.message);
                }
            }
            console.log(' Done.');
        };

        // Order matters!
        await insertTable('User', data.User, 'id');
        await insertTable('Material', data.Material, 'id'); // Sync ID too now
        await insertTable('Customer', data.Customer, 'id');
        await insertTable('PlantingLot', data.PlantingLot, 'id');
        await insertTable('ActivityLog', data.ActivityLog, 'id');

        await insertTable('Stock', data.Stock, 'id');
        await insertTable('Purchase', data.Purchase, 'id');
        await insertTable('StockAdjustment', data.StockAdjustment, 'id');
        await insertTable('Harvest', data.Harvest, 'id');
        await insertTable('Sale', data.Sale, 'id');

        console.log('\n✨ Full Sync Completed!');

    } catch (e) {
        console.error('❌ Load Failed:', e);
    } finally {
        await client.end();
    }
}

main();
