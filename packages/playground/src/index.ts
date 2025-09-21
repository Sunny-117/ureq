#!/usr/bin/env node

const { runBasicDemo } = require('./demos/basic');
const { runFeaturesDemo } = require('./demos/features');
const { runInterceptorsDemo } = require('./demos/interceptors');
const { runErrorHandlingDemo } = require('./demos/error-handling');

async function main() {
  console.log('🚀 @ureq Playground - HTTP Request Library Demo\n');
  
  try {
    console.log('='.repeat(50));
    console.log('📋 Running Basic Demo');
    console.log('='.repeat(50));
    await runBasicDemo();
    
    console.log('\n' + '='.repeat(50));
    console.log('⚡ Running Features Demo');
    console.log('='.repeat(50));
    await runFeaturesDemo();
    
    console.log('\n' + '='.repeat(50));
    console.log('🔧 Running Interceptors Demo');
    console.log('='.repeat(50));
    await runInterceptorsDemo();
    
    console.log('\n' + '='.repeat(50));
    console.log('❌ Running Error Handling Demo');
    console.log('='.repeat(50));
    await runErrorHandlingDemo();
    
    console.log('\n✅ All demos completed successfully!');
  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
