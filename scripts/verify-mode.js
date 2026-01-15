
const { Client } = require('pg');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync('.env')) {
    const config = dotenv.parse(fs.readFileSync('.env', 'utf8'));
    let url = config.DATABASE_URL;

    // Ensure we are testing the PRODUCTION TARGET (Port 5432)
    // We force the URL to look like what we TOLD them to use.
    url = url.replace(':6543', ':5432');
    if (!url.includes('pgbouncer=true')) {
        url += url.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true';
    }

    console.log('Testing Mode on URL:', url.replace(/:([^:@]+)@/, ':****@'));

    async function main() {
        const client = new Client({ connectionString: url });
        try {
            await client.connect();

            // Test 1: Set a variable
            await client.query("SET application_name = 'TEST_MODE_CHECK'");

            // Test 2: Read it back
            // In Transaction Mode, the 'connection' is returned to the pool after the first query.
            // The second query likely gets a *different* connection (or cleaned one), so variable should be reset/gone.
            // In Session Mode, we keep the connection, so variable persists.
            const res = await client.query("SHOW application_name");
            const appName = res.rows[0].application_name;

            console.log('\n--- RESULT ---');
            console.log(`SET application_name = 'TEST_MODE_CHECK'`);
            console.log(`SHOW application_name returned: '${appName}'`);

            if (appName === 'TEST_MODE_CHECK') {
                console.log('\n[DIAGNOSIS]: SESSION MODE DETECTED (BAD ❌)');
                console.log('Use of Port 5432 is behaving like Session Mode.');
                console.log('This explains the "MaxClients" error.');
                console.log('ACTION: You MUST change Port 5432 to TRANSACTION Mode in Supabase Dashboard.');
            } else {
                console.log('\n[DIAGNOSIS]: TRANSACTION MODE DETECTED (GOOD ✅)');
                console.log('The variable did not persist, which is correct for Transaction Mode.');
                console.log('If you still see errors on Vercel, check if Vercel Env Vars match this URL.');
            }

        } catch (e) {
            console.error('Connection Error:', e.message);
        } finally {
            await client.end();
        }
    }

    main();
}
