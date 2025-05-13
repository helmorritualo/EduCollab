// ES Module bootstrap file for TypeScript path aliases
import { register } from 'tsconfig-paths';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createRequire } from 'module';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register TypeScript path aliases
register({
  baseUrl: resolve(__dirname, 'dist'),
  paths: {
    '@/*': ['*']
  }
});

// Import and run the compiled application
import './dist/index.js';
