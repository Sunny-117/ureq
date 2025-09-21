import { Request as UreqRequestFeatures } from '@ureq/core';
import { FetchRequestor as FetchRequestorFeatures } from '@ureq/impl-fetch';
import { MemoryCacheStore as MemoryCacheStoreFeatures } from '@ureq/core';

const MOCK_API_BASE_FEATURES = 'https://jsonplaceholder.typicode.com';

async function runFeaturesDemo() {
  console.log('⚡ Advanced Features Demo\n');

  // Demo 1: Timeout Feature
  console.log('⏱️  Timeout Feature Demo:');
  const timeoutRequest = new UreqRequestFeatures(new FetchRequestorFeatures({ baseURL: MOCK_API_BASE_FEATURES }), {
    timeout: 5000 // 5 seconds timeout
  });

  try {
    console.log('  Making request with 5s timeout...');
    const data = await timeoutRequest.get('/posts/1');
    console.log('  ✅ Request completed within timeout:', { id: data.id });
  } catch (error) {
    console.error('  ❌ Timeout error:', error);
  }

  // Demo 2: Retry Feature
  console.log('\n🔄 Retry Feature Demo:');
  const retryRequest = new UreqRequestFeatures(new FetchRequestorFeatures({ baseURL: MOCK_API_BASE_FEATURES }), {
    retry: {
      maxRetries: 3,
      retryDelay: 1000,
      shouldRetry: (error: any) => error.status ? error.status >= 500 : true
    }
  });

  try {
    console.log('  Making request with retry configuration...');
    const data = await retryRequest.get('/posts/1');
    console.log('  ✅ Request succeeded:', { id: data.id });
  } catch (error) {
    console.error('  ❌ Retry failed:', error);
  }

  // Demo 3: Cache Feature
  console.log('\n💾 Cache Feature Demo:');
  const cacheRequest = new UreqRequestFeatures(new FetchRequestorFeatures({ baseURL: MOCK_API_BASE_FEATURES }), {
    cache: {
      ttl: 60000, // 1 minute cache
      store: new MemoryCacheStoreFeatures(),
      getCacheKey: (url: any, options: any) => `${url}-${JSON.stringify(options)}`
    }
  });

  try {
    console.log('  First request (will be cached)...');
    const start1 = Date.now();
    const data1 = await cacheRequest.get('/posts/1');
    const time1 = Date.now() - start1;
    console.log(`  ✅ First request completed in ${time1}ms:`, { id: data1.id });

    console.log('  Second request (from cache)...');
    const start2 = Date.now();
    const data2 = await cacheRequest.get('/posts/1');
    const time2 = Date.now() - start2;
    console.log(`  ✅ Cached request completed in ${time2}ms:`, { id: data2.id });
    console.log(`  🚀 Cache speedup: ${Math.round((time1 - time2) / time1 * 100)}%`);
  } catch (error) {
    console.error('  ❌ Cache demo error:', error);
  }

  // Demo 4: Parallel Requests Feature
  console.log('\n🔀 Parallel Requests Demo:');
  const parallelRequest = new UreqRequestFeatures(new FetchRequestorFeatures({ baseURL: MOCK_API_BASE_FEATURES }), {
    parallel: {
      maxConcurrent: 3
    }
  });

  try {
    console.log('  Making 5 parallel requests with max 3 concurrent...');
    const start = Date.now();
    const promises = [
      parallelRequest.get('/posts/1'),
      parallelRequest.get('/posts/2'),
      parallelRequest.get('/posts/3'),
      parallelRequest.get('/posts/4'),
      parallelRequest.get('/posts/5')
    ];

    const results = await Promise.all(promises);
    const time = Date.now() - start;
    console.log(`  ✅ All ${results.length} requests completed in ${time}ms`);
    console.log('  📊 Post IDs:', results.map(r => r.id));
  } catch (error) {
    console.error('  ❌ Parallel requests error:', error);
  }

  // Demo 5: Idempotent Requests Feature
  console.log('\n🔒 Idempotent Requests Demo:');
  const idempotentRequest = new UreqRequestFeatures(new FetchRequestorFeatures({ baseURL: MOCK_API_BASE_FEATURES }), {
    idempotent: {
      dedupeTime: 2000 // 2 seconds deduplication window
    }
  });

  try {
    console.log('  Making duplicate requests within deduplication window...');
    const start = Date.now();
    
    // Make the same request multiple times simultaneously
    const promises = [
      idempotentRequest.get('/posts/1'),
      idempotentRequest.get('/posts/1'),
      idempotentRequest.get('/posts/1')
    ];
    
    const results = await Promise.all(promises);
    const time = Date.now() - start;
    
    console.log(`  ✅ ${promises.length} duplicate requests completed in ${time}ms`);
    console.log('  🎯 All results identical:', results.every(r => r.id === results[0].id));
    console.log('  💡 Only one actual HTTP request was made due to deduplication');
  } catch (error) {
    console.error('  ❌ Idempotent requests error:', error);
  }

  // Demo 6: Combined Features
  console.log('\n🎯 Combined Features Demo:');
  const combinedRequest = new UreqRequestFeatures(new FetchRequestorFeatures({ baseURL: MOCK_API_BASE_FEATURES }), {
    timeout: 10000,
    retry: { maxRetries: 2, retryDelay: 500 },
    cache: { ttl: 30000, store: new MemoryCacheStoreFeatures() },
    idempotent: { dedupeTime: 1000 }
  });

  try {
    console.log('  Making request with all features enabled...');
    const data = await combinedRequest.get('/posts/1');
    console.log('  ✅ Combined features request succeeded:', { id: data.id, title: data.title.substring(0, 30) + '...' });
  } catch (error) {
    console.error('  ❌ Combined features error:', error);
  }

  console.log('\n✅ Features demo completed!\n');
}

export { runFeaturesDemo };

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFeaturesDemo().catch(console.error);
}
