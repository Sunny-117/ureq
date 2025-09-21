import { Request as UreqRequestInterceptors } from '@ureq/core';
import { FetchRequestor as FetchRequestorInterceptors } from '@ureq/impl-fetch';

const MOCK_API_BASE_INTERCEPTORS = 'https://jsonplaceholder.typicode.com';

async function runInterceptorsDemo() {
  console.log('🔧 Interceptors Demo\n');

  const request = new UreqRequestInterceptors(new FetchRequestorInterceptors({ baseURL: MOCK_API_BASE_INTERCEPTORS }));

  // Demo 1: Request Interceptor
  console.log('📤 Request Interceptor Demo:');
  
  const removeRequestInterceptor = request.interceptors.addRequestInterceptor({
    onRequest: (config: any) => {
      console.log('  🔍 Request interceptor: Adding auth header and timestamp');
      return {
        ...config,
        headers: {
          ...config.headers,
          'Authorization': 'Bearer demo-token',
          'X-Request-Time': new Date().toISOString()
        }
      };
    }
  });

  try {
    console.log('  Making request with request interceptor...');
    const data = await request.get('/posts/1');
    console.log('  ✅ Request with interceptor succeeded:', { id: data.id });
  } catch (error) {
    console.error('  ❌ Request interceptor error:', error);
  }

  // Demo 2: Response Interceptor
  console.log('\n📥 Response Interceptor Demo:');
  
  const removeResponseInterceptor = request.interceptors.addResponseInterceptor({
    onResponse: (response: any) => {
      console.log('  🔍 Response interceptor: Adding metadata and transforming data');
      return {
        ...response,
        data: {
          ...response.data,
          _metadata: {
            intercepted: true,
            timestamp: new Date().toISOString(),
            originalStatus: response.status
          }
        }
      };
    }
  });

  try {
    console.log('  Making request with response interceptor...');
    const data = await request.get('/posts/2');
    console.log('  ✅ Response with interceptor succeeded:');
    console.log('    📊 Original data:', { id: data.id, title: data.title.substring(0, 30) + '...' });
    console.log('    🏷️  Metadata:', data._metadata);
  } catch (error) {
    console.error('  ❌ Response interceptor error:', error);
  }

  // Demo 3: Multiple Interceptors
  console.log('\n🔗 Multiple Interceptors Demo:');
  
  // Add another request interceptor
  const removeSecondRequestInterceptor = request.interceptors.addRequestInterceptor({
    onRequest: (config: any) => {
      console.log('  🔍 Second request interceptor: Adding user agent');
      return {
        ...config,
        headers: {
          ...config.headers,
          'User-Agent': '@ureq-playground/1.0.0'
        }
      };
    }
  });

  // Add another response interceptor
  const removeSecondResponseInterceptor = request.interceptors.addResponseInterceptor({
    onResponse: (response: any) => {
      console.log('  🔍 Second response interceptor: Adding processing time');
      return {
        ...response,
        data: {
          ...response.data,
          _processing: {
            processedAt: Date.now(),
            interceptorChain: ['metadata', 'processing']
          }
        }
      };
    }
  });

  try {
    console.log('  Making request with multiple interceptors...');
    const data = await request.get('/posts/3');
    console.log('  ✅ Request with multiple interceptors succeeded:');
    console.log('    📊 Original data:', { id: data.id, title: data.title.substring(0, 30) + '...' });
    console.log('    🏷️  Metadata:', data._metadata);
    console.log('    ⚡ Processing:', data._processing);
  } catch (error) {
    console.error('  ❌ Multiple interceptors error:', error);
  }

  // Demo 4: Conditional Interceptor
  console.log('\n🎯 Conditional Interceptor Demo:');
  
  const removeConditionalInterceptor = request.interceptors.addRequestInterceptor({
    onRequest: (config: any) => {
      // Only add special header for specific endpoints
      if (config.url?.includes('/posts/4')) {
        console.log('  🔍 Conditional interceptor: Adding special header for posts/4');
        return {
          ...config,
          headers: {
            ...config.headers,
            'X-Special-Endpoint': 'true'
          }
        };
      }
      return config;
    }
  });

  try {
    console.log('  Making request to /posts/4 (triggers conditional interceptor)...');
    await request.get('/posts/4');
    console.log('  ✅ Conditional interceptor triggered');

    console.log('  Making request to /posts/5 (no conditional interceptor)...');
    await request.get('/posts/5');
    console.log('  ✅ Conditional interceptor not triggered');
  } catch (error) {
    console.error('  ❌ Conditional interceptor error:', error);
  }

  // Demo 5: Interceptor Removal
  console.log('\n🗑️  Interceptor Removal Demo:');
  
  console.log('  Removing all interceptors...');
  removeRequestInterceptor();
  removeResponseInterceptor();
  removeSecondRequestInterceptor();
  removeSecondResponseInterceptor();
  removeConditionalInterceptor();

  try {
    console.log('  Making request without interceptors...');
    const data = await request.get('/posts/6');
    console.log('  ✅ Request without interceptors succeeded:', { id: data.id });
    console.log('  📝 No metadata or processing info added (interceptors removed)');
  } catch (error) {
    console.error('  ❌ Request without interceptors error:', error);
  }

  console.log('\n✅ Interceptors demo completed!\n');
}

export { runInterceptorsDemo };

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runInterceptorsDemo().catch(console.error);
}
