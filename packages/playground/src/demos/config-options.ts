import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

// ============================================
// 配置选项 Demo - 测试各种功能是否生效
// ============================================

// ============================================
// 1. 重试功能测试
// ============================================
async function testRetry() {
  console.log('\n=== 测试重试功能 ===');

  let retryJudgeCount = 0;  // shouldRetry 被调用次数
  let actualRequestCount = 0;  // 实际发起请求次数

  const request = new Request(
    new FetchRequestor(),
    {
      retry: {
        maxRetries: 3,
        retryDelay: 500,
        shouldRetry: (error) => {
          retryJudgeCount++;
          console.log(`[shouldRetry] 判断 #${retryJudgeCount}:`, error.message || error);
          return true; // 总是重试
        }
      }
    }
  );

  // 添加请求拦截器来统计实际发起的请求次数
  request.interceptors.addRequestInterceptor({
    onRequest: (config) => {
      actualRequestCount++;
      console.log(`[拦截器] 发起请求 #${actualRequestCount}:`, config.url);
      return config;
    }
  });

  try {
    // 请求一个返回500的接口来触发错误
    await request.get('https://httpbin.org/status/500');
  } catch (error: any) {
    console.log('最终失败:', error.message || error);
    console.log(`--- 统计 ---`);
    console.log(`shouldRetry 调用次数: ${retryJudgeCount}`);
    console.log(`实际发起请求次数: ${actualRequestCount}`);
    console.log(`预期: maxRetries=3, 所以应该发起 1(初始) + 3(重试) = 4 次请求`);
  }
}

// ============================================
// 2. 超时功能测试
// ============================================
async function testTimeout() {
  console.log('\n=== 测试超时功能 ===');

  const request = new Request(
    new FetchRequestor(),
    {
      timeout: {
        timeout: 1000, // 1秒超时
        timeoutErrorMessage: '请求超时了！'
      }
    }
  );

  const startTime = Date.now();
  try {
    // 请求一个延迟接口
    await request.get('https://httpbin.org/delay/5'); // 5秒延迟
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.log(`超时错误 (${elapsed}ms):`, error.message || error);
  }
}

// ============================================
// 3. 缓存功能测试
// ============================================
async function testCache() {
  console.log('\n=== 测试缓存功能 ===');

  const request = new Request(
    new FetchRequestor(),
    {
      cache: {
        ttl: 10000 // 10秒缓存
      }
    }
  );

  console.log('第一次请求...');
  const start1 = Date.now();
  const data1 = await request.get('https://httpbin.org/uuid');
  console.log(`第一次响应 (${Date.now() - start1}ms):`, data1);

  console.log('第二次请求 (应该命中缓存)...');
  const start2 = Date.now();
  const data2 = await request.get('https://httpbin.org/uuid');
  console.log(`第二次响应 (${Date.now() - start2}ms):`, data2);

  // 如果缓存生效，两次数据应该相同
  console.log('缓存是否生效:', JSON.stringify(data1) === JSON.stringify(data2) ? '✅ 是' : '❌ 否');
}

// ============================================
// 4. 并发控制测试
// ============================================
async function testParallel() {
  console.log('\n=== 测试并发控制 ===');

  const request = new Request(
    new FetchRequestor(),
    {
      parallel: {
        maxConcurrent: 2 // 最多2个并发
      }
    }
  );

  const urls = [
    'https://httpbin.org/delay/1',
    'https://httpbin.org/delay/1',
    'https://httpbin.org/delay/1',
    'https://httpbin.org/delay/1',
  ];

  console.log(`同时发起 ${urls.length} 个请求，最大并发设为 2...`);
  const startTime = Date.now();

  await Promise.all(urls.map((url, i) =>
    request.get(url).then(() => {
      console.log(`请求 #${i + 1} 完成 (${Date.now() - startTime}ms)`);
    })
  ));

  const totalTime = Date.now() - startTime;
  console.log(`总耗时: ${totalTime}ms`);
  console.log('如果并发控制生效，4个1秒请求应该需要约2秒');
}

// ============================================
// 5. 幂等性测试
// ============================================
async function testIdempotent() {
  console.log('\n=== 测试幂等性 (去重) ===');

  const request = new Request(
    new FetchRequestor(),
    {
      idempotent: {
        dedupeTime: 5000 // 5秒内相同请求去重
      }
    }
  );

  console.log('同时发起3个相同请求...');
  const startTime = Date.now();

  const results = await Promise.all([
    request.get('https://httpbin.org/uuid'),
    request.get('https://httpbin.org/uuid'),
    request.get('https://httpbin.org/uuid'),
  ]);

  console.log(`完成 (${Date.now() - startTime}ms)`);
  console.log('结果1:', results[0]);
  console.log('结果2:', results[1]);
  console.log('结果3:', results[2]);

  // 如果去重生效，所有结果应该相同
  const allSame = results.every(r => JSON.stringify(r) === JSON.stringify(results[0]));
  console.log('去重是否生效:', allSame ? '✅ 是' : '❌ 否 (结果不同)');
}

// ============================================
// 6. 组合功能测试
// ============================================
async function testCombined() {
  console.log('\n=== 测试组合功能 ===');

  const request = new Request(
    new FetchRequestor({
      baseURL: 'https://httpbin.org'
    }),
    {
      retry: {
        maxRetries: 2,
        retryDelay: 300
      },
      timeout: {
        timeout: 5000
      },
      cache: {
        ttl: 30000
      }
    }
  );

  // 添加拦截器
  request.interceptors.addRequestInterceptor({
    onRequest: (config) => {
      console.log('[拦截器] 发起请求:', config.url);
      return config;
    }
  });

  request.interceptors.addResponseInterceptor({
    onResponse: (response) => {
      console.log('[拦截器] 收到响应:', response.status);
      return response;
    }
  });

  try {
    const data = await request.get('/json');
    console.log('请求成功:', typeof data);
  } catch (error: any) {
    console.log('请求失败:', error.message);
  }
}

// 运行测试
async function main() {
  console.log('========================================');
  console.log('  @ureq/core 配置选项功能测试');
  console.log('========================================');

  try {
    await testCombined();
    await testCache();
    await testRetry();
    // await testTimeout(); // 会等待超时
    // await testParallel(); // 需要较长时间
    // await testIdempotent();

    console.log('\n========================================');
    console.log('  测试完成!');
    console.log('========================================');
  } catch (error) {
    console.error('测试出错:', error);
  }
}

main();
