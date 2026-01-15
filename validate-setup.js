#!/usr/bin/env node

/**
 * Setup Validation Script
 * 
 * This script validates that the starter project is set up correctly
 * and all basic functionality works as expected.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🔍 Validating starter project setup...\n');

// Check required files exist
const requiredFiles = [
    'package.json',
    'server.js',
    'public/index.html',
    'public/styles.css',
    'src/app.js',
    '.eslintrc.js',
    'README.md'
];

const requiredDirectories = [
    'src/models',
    'src/services', 
    'src/utils',
    'tests'
];

let allValid = true;

// Validate files
console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - MISSING`);
        allValid = false;
    }
});

// Validate directories
console.log('\n📂 Checking required directories...');
requiredDirectories.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`  ✅ ${dir}/`);
    } else {
        console.log(`  ❌ ${dir}/ - MISSING`);
        allValid = false;
    }
});

// Check package.json content
console.log('\n📦 Validating package.json...');
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const requiredScripts = ['start', 'test', 'lint', 'format'];
    requiredScripts.forEach(script => {
        if (pkg.scripts && pkg.scripts[script]) {
            console.log(`  ✅ Script: ${script}`);
        } else {
            console.log(`  ❌ Script: ${script} - MISSING`);
            allValid = false;
        }
    });
    
    const requiredDeps = ['express'];
    requiredDeps.forEach(dep => {
        if (pkg.dependencies && pkg.dependencies[dep]) {
            console.log(`  ✅ Dependency: ${dep}`);
        } else {
            console.log(`  ❌ Dependency: ${dep} - MISSING`);
            allValid = false;
        }
    });
    
    const requiredDevDeps = ['jest', 'eslint', 'prettier'];
    requiredDevDeps.forEach(dep => {
        if (pkg.devDependencies && pkg.devDependencies[dep]) {
            console.log(`  ✅ Dev Dependency: ${dep}`);
        } else {
            console.log(`  ❌ Dev Dependency: ${dep} - MISSING`);
            allValid = false;
        }
    });
    
} catch (error) {
    console.log('  ❌ Error reading package.json:', error.message);
    allValid = false;
}

// Final result
console.log('\n' + '='.repeat(50));
if (allValid) {
    console.log('🎉 Starter project setup is VALID!');
    console.log('✅ Ready for Day 1 of the Software Engineering course');
    console.log('\n📖 Next steps:');
    console.log('   1. Run: npm start');
    console.log('   2. Open: http://localhost:3000');
    console.log('   3. Begin Day 1 materials');
} else {
    console.log('❌ Starter project setup has ISSUES!');
    console.log('🔧 Please fix the missing files/directories above');
    process.exit(1);
}

console.log('='.repeat(50));