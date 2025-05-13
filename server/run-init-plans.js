const { execSync } = require('child_process');

try {
  // Compile the TypeScript file
  console.log('Compiling TypeScript file...');
  execSync('npx tsc --esModuleInterop --resolveJsonModule src/scripts/init-subscription-plans.ts', { stdio: 'inherit' });
  
  // Run the compiled JavaScript file
  console.log('\nRunning compiled JavaScript file...');
  execSync('node src/scripts/init-subscription-plans.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error occurred:', error.message);
}
