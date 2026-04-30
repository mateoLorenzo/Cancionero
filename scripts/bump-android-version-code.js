const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

const content = fs.readFileSync(buildGradlePath, 'utf8');
const match = content.match(/versionCode\s+(\d+)/);

if (!match) {
  console.error('Could not find versionCode in build.gradle');
  process.exit(1);
}

const current = parseInt(match[1], 10);
const next = current + 1;
const updated = content.replace(/versionCode\s+\d+/, `versionCode ${next}`);

fs.writeFileSync(buildGradlePath, updated);
console.log(`versionCode: ${current} → ${next}`);
