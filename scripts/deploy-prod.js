const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Manual Production Deployment...');

const envPath = path.join(__dirname, '../.env.prod');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);

if (!match) {
    console.error('❌ Could not find DATABASE_URL in .env.prod');
    process.exit(1);
}

const dbUrl = match[1];
console.log(`🔌 Target DB: ${dbUrl.split('@')[1].split(':')[0]}...`);

// Parse DIRECT_URL
const matchDirect = envContent.match(/DIRECT_URL="?([^"\n]+)"?/);
let directUrl = undefined;
if (matchDirect) {
    directUrl = matchDirect[1];
    console.log(`🔗 Direct URL found: ${directUrl.split('@')[1].split(':')[0]}...`);
}

// Run prisma migrate deploy with the custom env
const cmd = 'npx prisma migrate deploy';
console.log(`▶️  Running: ${cmd}`);

const envVars = { ...process.env, DATABASE_URL: dbUrl };
if (directUrl) {
    envVars.DIRECT_URL = directUrl;
}

const child = exec(cmd, {
    env: envVars,
    cwd: path.join(__dirname, '..')
});

child.stdout.on('data', (data) => console.log(data.toString()));
child.stderr.on('data', (data) => console.error(data.toString()));

child.on('exit', (code) => {
    if (code === 0) {
        console.log('✅ Migration deployed successfully!');
    } else {
        console.error(`❌ Migration failed with code ${code}`);
        process.exit(code);
    }
});
