// This bootstrap file registers TypeScript path aliases for runtime
require('tsconfig-paths').register({
  baseUrl: 'dist',
  paths: {
    '@/*': ['*']
  }
});

// Import and run the compiled application
require('./dist/index.js');
