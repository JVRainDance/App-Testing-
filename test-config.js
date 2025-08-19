#!/usr/bin/env node

/**
 * Configuration Test Script
 * 
 * This script helps verify that your environment is properly configured
 * for the CRO-UX Analysis Tool.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 CRO-UX Analysis Tool - Configuration Test\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

console.log('📁 Environment File Check:');
if (envExists) {
  console.log('✅ .env.local file found');
  
  // Read and check environment variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  console.log('\n🔑 Environment Variables Check:');
  
  // Check OpenAI API Key
  if (envVars.OPENAI_API_KEY) {
    if (envVars.OPENAI_API_KEY.startsWith('sk-')) {
      console.log('✅ OPENAI_API_KEY is configured');
    } else {
      console.log('⚠️  OPENAI_API_KEY format may be incorrect (should start with "sk-")');
    }
  } else {
    console.log('❌ OPENAI_API_KEY is missing (required for AI analysis)');
  }
  
  // Check PostHog Configuration
  if (envVars.NEXT_PUBLIC_POSTHOG_KEY) {
    if (envVars.NEXT_PUBLIC_POSTHOG_KEY.startsWith('phc_')) {
      console.log('✅ NEXT_PUBLIC_POSTHOG_KEY is configured');
    } else {
      console.log('⚠️  NEXT_PUBLIC_POSTHOG_KEY format may be incorrect (should start with "phc_")');
    }
  } else {
    console.log('ℹ️  NEXT_PUBLIC_POSTHOG_KEY is not configured (optional for analytics)');
  }
  
  if (envVars.NEXT_PUBLIC_POSTHOG_HOST) {
    console.log('✅ NEXT_PUBLIC_POSTHOG_HOST is configured');
  } else {
    console.log('ℹ️  NEXT_PUBLIC_POSTHOG_HOST is not configured (will use default)');
  }
  
} else {
  console.log('❌ .env.local file not found');
  console.log('   Create it by copying env.example: cp env.example .env.local');
}

// Check package.json dependencies
console.log('\n📦 Dependencies Check:');
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredDeps = [
    'next', 'react', 'react-dom', 'openai', 'jspdf', 
    'posthog-js', 'axios', 'lucide-react'
  ];
  
  const missingDeps = [];
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
      missingDeps.push(dep);
    }
  });
  
  if (missingDeps.length === 0) {
    console.log('✅ All required dependencies are listed in package.json');
  } else {
    console.log('❌ Missing dependencies:', missingDeps.join(', '));
    console.log('   Run: npm install');
  }
} else {
  console.log('❌ package.json not found');
}

// Check if node_modules exists
console.log('\n📂 Installation Check:');
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules directory exists');
} else {
  console.log('❌ node_modules directory not found');
  console.log('   Run: npm install');
}

// Check Next.js configuration
console.log('\n⚙️  Next.js Configuration:');
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  console.log('✅ next.config.js found');
} else {
  console.log('ℹ️  next.config.js not found (using default configuration)');
}

// Check TypeScript configuration
console.log('\n🔷 TypeScript Configuration:');
const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
if (fs.existsSync(tsConfigPath)) {
  console.log('✅ tsconfig.json found');
} else {
  console.log('❌ tsconfig.json not found');
}

// Summary and recommendations
console.log('\n📋 Summary & Recommendations:');

if (!envExists) {
  console.log('1. Create .env.local file with your API keys');
  console.log('2. Add OPENAI_API_KEY for AI-powered analysis');
  console.log('3. Add PostHog keys for analytics (optional)');
}

if (!fs.existsSync(nodeModulesPath)) {
  console.log('4. Install dependencies: npm install');
}

console.log('\n🚀 To start the development server:');
console.log('   npm run dev');
console.log('\n🌐 Then open: http://localhost:3000');

console.log('\n📚 For more help, see:');
console.log('   - README.md for setup instructions');
console.log('   - DEPLOYMENT.md for deployment guide');
console.log('   - GitHub issues for troubleshooting');

console.log('\n✨ Happy analyzing!');
