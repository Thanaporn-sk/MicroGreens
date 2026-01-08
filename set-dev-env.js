
const fs = require('fs');
const dotenv = require('dotenv');

// Load production config
const prodConfig = dotenv.parse(fs.readFileSync('.env.prod'));
const prodDbUrl = prodConfig.DATABASE_URL;
const prodDirectUrl = prodConfig.DIRECT_URL;

if (!prodDbUrl) {
    console.error('DATABASE_URL not found in .env.prod');
    process.exit(1);
}

// Load current .env or create empty
let envContent = '';
if (fs.existsSync('.env')) {
    envContent = fs.readFileSync('.env', 'utf8');
}

// Replace or append DATABASE_URL
if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL="${prodDbUrl}"`);
} else {
    envContent += `\nDATABASE_URL="${prodDbUrl}"`;
}

// Replace or append DIRECT_URL
if (envContent.includes('DIRECT_URL=')) {
    envContent = envContent.replace(/DIRECT_URL=.*/, `DIRECT_URL="${prodDirectUrl || prodDbUrl}"`);
} else {
    envContent += `\nDIRECT_URL="${prodDirectUrl || prodDbUrl}"`;
}

fs.writeFileSync('.env', envContent);
console.log('Successfully updated .env with Production DB URL');
console.log('DB Host:', prodDbUrl.match(/@([^:/]+)/)[1]);
