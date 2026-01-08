const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Regex to extract password from standard Supabase connection string
// Format: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DB]
// Or generic: postgresql://[USER]:[PASSWORD]@[HOST]...
// We grab everything between the first colon-after-user and the @ symbol.
const match = envContent.match(/DATABASE_URL="?postgresql:\/\/[^:]+:([^@]+)@/);

if (!match) {
    console.error('Could not find existing password in DATABASE_URL');
    process.exit(1);
}

const password = match[1];
const newHost = 'aws-1-ap-south-1.pooler.supabase.com';
const newPort = '6543'; // Session POOL
const newUser = 'postgres.xgwokqgdwmdwuukgawvd';
const newDb = 'postgres';

const newUrl = `postgresql://${newUser}:${password}@${newHost}:${newPort}/${newDb}`;

let newEnvContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL="${newUrl}"`);
// Also update DIRECT_URL if it exists, reuse the same working session URL
newEnvContent = newEnvContent.replace(/DIRECT_URL=.*/, `DIRECT_URL="${newUrl}"`);

fs.writeFileSync(envPath, newEnvContent);
console.log('Updated .env successfully');
console.log('New URL starts with:', newUrl.substring(0, 30) + '...');
