const fs = require('fs');
const path = require('path');

const buildInfo = {
    buildTime: new Date().toISOString(),
    timestamp: Date.now()
};

const outputPath = path.join(__dirname, '../../public/data/build-info.json');
fs.writeFileSync(outputPath, JSON.stringify(buildInfo, null, 2));

console.log('✅ Build info generated:', buildInfo.buildTime);