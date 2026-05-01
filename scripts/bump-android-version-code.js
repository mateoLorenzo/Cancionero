const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
const appJsonPath = path.join(__dirname, '..', 'app.json');

const gradleContent = fs.readFileSync(buildGradlePath, 'utf8');
const match = gradleContent.match(/versionCode\s+(\d+)/);

if (!match) {
  console.error('Could not find versionCode in build.gradle');
  process.exit(1);
}

const current = parseInt(match[1], 10);
const next = current + 1;

const updatedGradle = gradleContent.replace(/versionCode\s+\d+/, `versionCode ${next}`);
fs.writeFileSync(buildGradlePath, updatedGradle);

const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
appJson.expo.android = appJson.expo.android || {};
appJson.expo.android.versionCode = next;
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

console.log(`versionCode: ${current} → ${next}`);
console.log(`  ✓ android/app/build.gradle`);
console.log(`  ✓ app.json (expo.android.versionCode)`);
