# 响应类型与转换

ureq 支持多种响应类型和自定义响应转换，让你能够灵活处理各种 API 返回格式。

## 响应类型 (responseType)

通过 `responseType` 选项指定如何解析响应体。

### 支持的类型

| 类型 | 说明 | 返回值类型 |
|------|------|-----------|
| `json` | JSON 数据（默认） | `T` (泛型) |
| `text` | 纯文本 | `string` |
| `blob` | 二进制 Blob | `Blob` |
| `arraybuffer` | ArrayBuffer | `ArrayBuffer` |
| `formData` | FormData | `FormData` |

### 使用示例

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(new FetchRequestor());

// JSON 响应（默认）
const jsonRes = await request.get<User>('/api/user/1');

// 文本响应
const textRes = await request.get<string>('/robots.txt', {
  responseType: 'text',
});

// Blob 响应（下载图片）
const blobRes = await request.get<Blob>('/api/avatar.png', {
  responseType: 'blob',
});

// ArrayBuffer 响应（处理二进制数据）
const bufferRes = await request.get<ArrayBuffer>('/api/file', {
  responseType: 'arraybuffer',
});
```

## 自定义响应转换器 (responseTransformer)

当内置的 `responseType` 无法满足需求时，可以使用 `responseTransformer` 自定义响应解析逻辑。

::: tip
`responseTransformer` 的优先级高于 `responseType`。当两者同时存在时，只会执行 `responseTransformer`。
:::

### 基本用法

```typescript
const res = await request.get<string[]>('/api/data', {
  responseTransformer: async (response) => {
    const json = await response.json();
    // 只返回需要的数据
    return json.data.items;
  },
});
```

### 应用场景

#### 1. 处理嵌套数据结构

很多 API 返回的数据结构是 `{ code, data, message }`，但你只关心 `data`：

```typescript
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

const res = await request.get<User>('/api/user/1', {
  responseTransformer: async (response) => {
    const json: ApiResponse<User> = await response.json();
    if (json.code !== 0) {
      throw new Error(json.message);
    }
    return json.data;
  },
});
// res.data 直接就是 User 类型
```

#### 2. 处理 JSONP 响应

```typescript
const res = await request.get<any>('/api/suggest?callback=cb', {
  responseTransformer: async (response) => {
    const text = await response.text();
    // 提取 cb({...}) 中的 JSON
    const match = text.match(/cb\((.+)\)/);
    if (match) {
      return JSON.parse(match[1]);
    }
    throw new Error('Invalid JSONP response');
  },
});
```

#### 3. 流式处理

```typescript
const res = await request.get<ReadableStream>('/api/stream', {
  responseTransformer: async (response) => {
    return response.body; // 返回原始流
  },
});

// 使用流
const reader = res.data.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log('Received chunk:', value);
}
```

#### 4. 数据转换与验证

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

const res = await request.get<z.infer<typeof UserSchema>>('/api/user/1', {
  responseTransformer: async (response) => {
    const json = await response.json();
    // 使用 zod 验证并转换数据
    return UserSchema.parse(json);
  },
});
```

## 实现差异

### FetchRequestor

- 完整支持所有 `responseType`
- `responseTransformer` 接收原始 `Response` 对象

### AxiosRequestor

- `responseType` 映射到 axios 的 `responseType`
- `responseTransformer` 接收 axios 的响应对象（包含 `data`, `status` 等）

```typescript
// Axios 的 responseTransformer 用法
const res = await request.get<User>('/api/user/1', {
  responseTransformer: async (axiosResponse) => {
    // axiosResponse.data 是已解析的数据
    return axiosResponse.data.user;
  },
});
```

## 类型定义

```typescript
// 响应类型
type ResponseType = 'json' | 'text' | 'blob' | 'arraybuffer' | 'formData';

// 响应转换器
type ResponseTransformer<T = any> = (response: any) => Promise<T>;

// RequestOptions
interface RequestOptions {
  responseType?: ResponseType;
  responseTransformer?: ResponseTransformer;
  // ...其他选项
}
```

## 相关

- [FetchRequestor](/api/implementations/fetch)
- [AxiosRequestor](/api/implementations/axios)
- [Requestor API](/api/core/requestor)
