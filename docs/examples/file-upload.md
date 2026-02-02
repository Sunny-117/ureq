# 文件上传示例

## 基础文件上传

```typescript
import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

const request = new Request(
  new FetchRequestor({
    baseURL: 'https://api.example.com'
  }),
  {
    timeout: { timeout: 60000 }  // 60 秒超时
  }
);

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const result = await request.post('/upload', formData);
    console.log('Upload success:', result);
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// 使用
const fileInput = document.querySelector<HTMLInputElement>('#file-input');
fileInput?.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    await uploadFile(file);
  }
});
```

## 多文件上传

```typescript
async function uploadMultipleFiles(files: FileList) {
  const formData = new FormData();
  
  Array.from(files).forEach((file, index) => {
    formData.append(`files[${index}]`, file);
  });
  
  return request.post('/upload/multiple', formData);
}
```

## 带元数据的上传

```typescript
async function uploadWithMetadata(file: File, metadata: {
  title: string;
  description: string;
}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', metadata.title);
  formData.append('description', metadata.description);
  
  return request.post('/upload', formData);
}
```

## 带重试的上传

```typescript
const uploadRequest = new Request(
  new FetchRequestor({
    baseURL: 'https://api.example.com'
  }),
  {
    retry: {
      maxRetries: 3,
      retryDelay: 2000
    },
    timeout: {
      timeout: 60000
    }
  }
);

async function uploadWithRetry(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const result = await uploadRequest.post('/upload', formData);
    return result;
  } catch (error) {
    console.error('Upload failed after retries:', error);
    throw error;
  }
}
```

## 图片上传预览

```typescript
async function uploadImage(file: File) {
  // 预览
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.querySelector<HTMLImageElement>('#preview');
    if (preview && e.target?.result) {
      preview.src = e.target.result as string;
    }
  };
  reader.readAsDataURL(file);
  
  // 上传
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const result = await request.post('/upload/image', formData);
    console.log('Image uploaded:', result.url);
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}
```

## Base64 上传

```typescript
async function uploadBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const result = await request.post('/upload/base64', {
          filename: file.name,
          data: base64
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

## 相关

- [基本用法](/examples/basic)
- [超时控制](/guide/features/timeout)
- [重试功能](/guide/features/retry)
