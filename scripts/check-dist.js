const fs = require('fs');
const path = require('path');

function checkDist(packagePath) {
  const distPath = path.join(packagePath, 'dist');
  if (!fs.existsSync(distPath)) {
    console.error(`❌ Dist folder not found in ${packagePath}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(distPath);
  if (files.length === 0) {
    console.error(`❌ Dist folder is empty in ${packagePath}`);
    process.exit(1);
  }
  
  console.log(`✅ Dist check passed for ${packagePath}`);
}

// 检查所有需要发布的包
const packages = [
  'packages/core',
  'packages/impl/fetch',
  'packages/impl/axios',
  'packages/lib/cache-store',
  'packages/lib/hash'
];

packages.forEach(pkg => checkDist(pkg)); 