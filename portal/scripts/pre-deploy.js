#!/usr/bin/env node

/**
 * Pre-deployment verification script
 * Run: node scripts/pre-deploy.js
 */

const fs = require('fs');
const path = require('path');

const checks = {
  envExample: '.env.example exists',
  viteConfig: 'vite.config.ts optimized',
  distBuilt: 'dist/ directory exists (after build)',
  packageJson: 'package.json has build script',
};

console.log('\n🚀 Pre-Deployment Checklist\n');

let passed = 0;
let failed = 0;

// Check .env.example
if (fs.existsSync(path.join(__dirname, '../.env.example'))) {
  console.log('✅ .env.example found');
  passed++;
} else {
  console.log('❌ .env.example missing - Run: npm install from project root');
  failed++;
}

// Check vite.config.ts
const viteContent = fs.readFileSync(path.join(__dirname, '../vite.config.ts'), 'utf-8');
if (viteContent.includes('manualChunks')) {
  console.log('✅ vite.config.ts has production optimizations');
  passed++;
} else {
  console.log('❌ vite.config.ts missing optimization - Update from DEPLOYMENT.md');
  failed++;
}

// Check package.json has build script
const pkgContent = fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8');
const pkg = JSON.parse(pkgContent);
if (pkg.scripts && pkg.scripts.build) {
  console.log('✅ package.json has build script');
  passed++;
} else {
  console.log('❌ package.json missing build script');
  failed++;
}

// Check dist exists (only if built)
if (fs.existsSync(path.join(__dirname, '../dist'))) {
  console.log('✅ Production build (dist/) ready');
  passed++;
} else {
  console.log('⏭️  dist/ not found - Run: npm run build');
}

console.log(`\n📊 Status: ${passed} passed${failed > 0 ? `, ${failed} failed` : ''}\n`);

if (failed > 0) {
  console.log('Fix the above issues before deploying.\n');
  process.exit(1);
} else {
  console.log('Ready to deploy! 🎉\n');
  process.exit(0);
}
