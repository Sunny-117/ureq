import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(new FetchRequestor());

// ============================================
// 示例 1: 默认 JSON 响应（最常见场景）
// ============================================
async function jsonResponse() {
  interface Todo {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
  }

  // Request.get 直接返回 data，类型为 T
  const data = await request.get<Todo>('https://jsonplaceholder.typicode.com/todos/1');
  console.log('JSON Response:', data);
  // { userId: 1, id: 1, title: '...', completed: false }
}

// ============================================
// 示例 2: 获取纯文本响应
// ============================================
async function textResponse() {
  const data = await request.get<string>('https://httpbin.org/robots.txt', {
    responseType: 'text',
  });
  console.log('Text Response:', data);
  // User-agent: *\nDisallow: /deny\n...
}

// ============================================
// 示例 3: 获取二进制数据 (Blob)
// ============================================
async function blobResponse() {
  const data = await request.get<Blob>('https://httpbin.org/image/png', {
    responseType: 'blob',
  });
  console.log('Blob Response: size =', data.size, ', type =', data.type);
  // Blob Response: size = 8090, type = image/png
}

// ============================================
// 示例 4: 获取 ArrayBuffer（用于处理二进制数据）
// ============================================
async function arrayBufferResponse() {
  const data = await request.get<ArrayBuffer>('https://httpbin.org/bytes/16', {
    responseType: 'arraybuffer',
  });
  console.log('ArrayBuffer Response:', data);
  console.log('Byte length:', data.byteLength);
}

// ============================================
// 示例 5: 自定义响应转换器
// ============================================
async function customTransformer() {
  const data = await request.get<string[]>('https://httpbin.org/json', {
    responseTransformer: async (response: Response) => {
      const json = await response.json();
      // 只提取我们需要的数据
      return json.slideshow?.slides?.map((s: any) => s.title) || [];
    },
  });
  console.log('Custom Transformed:', data);
  // ['Wake up to WonderWidgets!', 'Overview']
}

// ============================================
// 示例 6: 处理 JSONP 响应
// ============================================
async function jsonpResponse() {
  const data = await request.get<any>(
    'https://suggest.taobao.com/sug?code=utf-8&q=手机&callback=cb',
    {
      responseTransformer: async (response: Response) => {
        const text = await response.text();
        // 提取 JSONP 回调中的数据: cb({...})
        const match = text.match(/cb\((.+)\)/);
        if (match) {
          return JSON.parse(match[1]);
        }
        throw new Error('Invalid JSONP response');
      },
    }
  );
  console.log('JSONP Response:', data);
}

// ============================================
// 示例 7: 流式处理响应
// ============================================
async function streamResponse() {
  const data = await request.get<ReadableStream<Uint8Array> | null>(
    'https://httpbin.org/stream-bytes/1024',
    {
      responseTransformer: async (response: Response) => {
        // 返回原始流，由调用方处理
        return response.body;
      },
    }
  );
  console.log('Stream Response: readable =', data !== null);
  // Stream Response: readable = true
}

// 运行所有示例
async function main() {
  console.log('\n=== Response Type Examples ===\n');

  try {
    await jsonResponse();
    await textResponse();
    await blobResponse();
    await arrayBufferResponse();
    await customTransformer();
    await jsonpResponse();
    await streamResponse();
    console.log('\nAll examples completed!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
