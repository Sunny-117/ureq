const { Request: UreqRequest } = require('@ureq/core');
const { FetchRequestor } = require('@ureq/impl-fetch');
const { AxiosRequestor } = require('@ureq/impl-axios');

const MOCK_API_BASE = 'https://jsonplaceholder.typicode.com';

async function runErrorHandlingDemo() {
  console.log('❌ Error Handling Demo\n');

  // Demo 1: 404 Not Found Error
  console.log('🔍 404 Not Found Error Demo:');
  const fetchRequest = new UreqRequest(new FetchRequestor({ baseURL: MOCK_API_BASE }));

  try {
    console.log('  Requesting non-existent resource /posts/999999...');
    await fetchRequest.get('/posts/999999');
  } catch (error: any) {
    console.log('  ✅ Caught 404 error as expected:');
    console.log('    📊 Status:', (error as any).status || 'Unknown');
    console.log('    📝 Message:', error.message);
  }

  // Demo 2: Network Error Simulation
  console.log('\n🌐 Network Error Demo:');
  const invalidRequest = new UreqRequest(new FetchRequestor({ baseURL: 'https://invalid-domain-that-does-not-exist.com' }));

  try {
    console.log('  Requesting from invalid domain...');
    await invalidRequest.get('/test');
  } catch (error: any) {
    console.log('  ✅ Caught network error as expected:');
    console.log('    📝 Message:', error.message);
    console.log('    🔧 Type:', error.constructor.name);
  }

  // Demo 3: Timeout Error
  console.log('\n⏱️  Timeout Error Demo:');
  const timeoutRequest = new UreqRequest(new FetchRequestor({ baseURL: MOCK_API_BASE }), {
    timeout: 1 // Very short timeout to trigger error
  });

  try {
    console.log('  Making request with 1ms timeout (will timeout)...');
    await timeoutRequest.get('/posts/1');
  } catch (error: any) {
    console.log('  ✅ Caught timeout error as expected:');
    console.log('    📝 Message:', error.message);
    console.log('    🔧 Type:', error.constructor.name);
  }

  // Demo 4: Retry with Error Recovery
  console.log('\n🔄 Retry with Error Recovery Demo:');
  let attemptCount = 0;

  const retryRequest = new UreqRequest(new FetchRequestor({ baseURL: MOCK_API_BASE }), {
    retry: {
      maxRetries: 3,
      retryDelay: 500,
      shouldRetry: (error: any) => {
        attemptCount++;
        console.log(`    🔄 Retry attempt ${attemptCount}, error status: ${error.status || 'unknown'}`);
        // Only retry on 5xx errors or network errors
        return error.status ? error.status >= 500 : true;
      }
    }
  });

  try {
    console.log('  Making request that will succeed after retries...');
    // This should succeed on first try, but we'll see the retry logic in action with a 404
    await retryRequest.get('/posts/999999');
  } catch (error: any) {
    console.log('  ✅ Request failed after retries (as expected for 404):');
    console.log('    📊 Total attempts:', attemptCount);
    console.log('    📝 Final error:', error.message);
  }

  // Demo 5: Error Interceptor
  console.log('\n🔧 Error Interceptor Demo:');
  const interceptorRequest = new UreqRequest(new FetchRequestor({ baseURL: MOCK_API_BASE }));

  // Add error handling interceptor
  interceptorRequest.interceptors.addResponseInterceptor({
    onResponseError: (error: RequestError) => {
      console.log('  🔍 Error interceptor caught error:');
      console.log('    📊 Status:', error.status);
      console.log('    📝 Message:', error.message);
      console.log('    🏷️  Adding error metadata...');
      
      // Add metadata to error
      (error as any).metadata = {
        interceptedAt: new Date().toISOString(),
        errorId: Math.random().toString(36).substr(2, 9)
      };
      
      // Re-throw the error with metadata
      throw error;
    }
  });

  try {
    console.log('  Making request that will trigger error interceptor...');
    await interceptorRequest.get('/posts/999999');
  } catch (error) {
    console.log('  ✅ Error interceptor processed the error:');
    console.log('    🏷️  Error metadata:', (error as any).metadata);
  }

  // Demo 6: Graceful Error Handling with Fallbacks
  console.log('\n🛡️  Graceful Error Handling Demo:');
  
  async function fetchWithFallback(url: string) {
    const primaryRequest = new UreqRequest(new FetchRequestor({ baseURL: MOCK_API_BASE }));
    
    try {
      console.log(`    🎯 Trying primary request: ${url}`);
      return await primaryRequest.get(url);
    } catch (primaryError) {
      console.log('    ⚠️  Primary request failed, trying fallback...');
      
      try {
        // Fallback to a known working endpoint
        const fallbackData = await primaryRequest.get('/posts/1');
        console.log('    ✅ Fallback request succeeded');
        return {
          ...fallbackData,
          _fallback: true,
          _originalUrl: url
        };
      } catch (fallbackError) {
        console.log('    ❌ Fallback also failed');
        throw new Error(`Both primary and fallback requests failed: ${primaryError.message}`);
      }
    }
  }

  try {
    console.log('  Testing graceful error handling with fallback...');
    const result = await fetchWithFallback('/posts/999999');
    console.log('  ✅ Graceful handling succeeded:');
    console.log('    📊 Data ID:', result.id);
    console.log('    🔄 Used fallback:', result._fallback);
    console.log('    📝 Original URL:', result._originalUrl);
  } catch (error) {
    console.log('  ❌ Graceful handling failed:', error.message);
  }

  // Demo 7: Different Error Types Comparison
  console.log('\n⚖️  Error Types Comparison (Fetch vs Axios):');
  
  const axiosRequest = new UreqRequest(new AxiosRequestor({ baseURL: MOCK_API_BASE }));
  
  console.log('  Fetch implementation error:');
  try {
    await fetchRequest.get('/posts/999999');
  } catch (error) {
    console.log('    📝 Type:', error.constructor.name);
    console.log('    📊 Status:', (error as any).status);
  }
  
  console.log('  Axios implementation error:');
  try {
    await axiosRequest.get('/posts/999999');
  } catch (error) {
    console.log('    📝 Type:', error.constructor.name);
    console.log('    📊 Status:', (error as any).status);
  }

  console.log('\n✅ Error handling demo completed!\n');
}

module.exports = { runErrorHandlingDemo };

// Run the demo if this file is executed directly
if (require.main === module) {
  runErrorHandlingDemo().catch(console.error);
}
