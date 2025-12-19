const fs = require('fs');
const content = fs.readFileSync('.env', 'utf8');
const newDbUrl = 'postgresql://postgres.pbnvpdvjtdufjihyeczu:4Bxzu7THj3L1G54h@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true';
const newDirectUrl = 'postgresql://postgres.pbnvpdvjtdufjihyeczu:4Bxzu7THj3L1G54h@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';

let newContent = content.replace(/DATABASE_URL=.*/, `DATABASE_URL="${newDbUrl}"`);
newContent = newContent.replace(/DIRECT_URL=.*/, `DIRECT_URL="${newDirectUrl}"`);

fs.writeFileSync('.env', newContent);
console.log('Updated .env with DEV credentials');
