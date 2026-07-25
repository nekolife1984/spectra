#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const cliPath = path.join(__dirname, '..', 'tools', 'spectra', 'dist', 'cli.js');

// Build if dist doesn't exist (happens with npx github: installs)
if (!fs.existsSync(cliPath)) {
  console.error('Building spectra...');
  execSync('npm install && npm run build', {
    cwd: path.join(__dirname, '..', 'tools', 'spectra'),
    stdio: 'inherit',
  });
}

require(cliPath);
