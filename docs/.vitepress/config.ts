import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/ureq/',
  title: '@ureq',
  description: '模块化、可扩展的 HTTP 请求库 | A modular and extensible HTTP request library',
  
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }]
  ],
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '指南 | Guide', link: '/guide/' },
      { text: 'API', link: '/api/core/request' },
      { text: '示例 | Examples', link: '/examples/basic' },
      { 
        text: '更多 | More',
        items: [
          { text: 'GitHub', link: 'https://github.com/Sunny-117/ureq' },
          { text: 'npm', link: 'https://www.npmjs.com/package/@ureq/core' },
          { text: 'Changelog', link: 'https://github.com/Sunny-117/ureq/blob/main/CHANGELOG.md' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '介绍 | Introduction',
          items: [
            { text: '什么是 @ureq', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' }
          ]
        },
        {
          text: '核心功能 | Core Features',
          items: [
            { text: '智能重试', link: '/guide/features/retry' },
            { text: '请求缓存', link: '/guide/features/cache' },
            { text: '并发控制', link: '/guide/features/parallel' },
            { text: '幂等性保证', link: '/guide/features/idempotent' },
            { text: '超时控制', link: '/guide/features/timeout' },
            { text: '响应类型与转换', link: '/guide/features/response-type' }
          ]
        },
        {
          text: '进阶指南 | Advanced',
          items: [
            { text: '拦截器', link: '/guide/advanced/interceptors' },
            { text: '自定义请求器', link: '/guide/advanced/custom-requestor' },
            { text: '错误处理', link: '/guide/advanced/error-handling' }
          ]
        }
      ],
      '/api/': [
        {
          text: '核心 API | Core',
          items: [
            { text: 'Request', link: '/api/core/request' },
            { text: 'Interceptor', link: '/api/core/interceptor' },
            { text: 'Requestor', link: '/api/core/requestor' }
          ]
        },
        {
          text: '实现 | Implementations',
          items: [
            { text: 'FetchRequestor', link: '/api/implementations/fetch' },
            { text: 'AxiosRequestor', link: '/api/implementations/axios' }
          ]
        },
        {
          text: '功能 | Features',
          items: [
            { text: 'Retry', link: '/api/features/retry' },
            { text: 'Cache', link: '/api/features/cache' },
            { text: 'Parallel', link: '/api/features/parallel' },
            { text: 'Idempotent', link: '/api/features/idempotent' },
            { text: 'Timeout', link: '/api/features/timeout' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '基础示例 | Basic',
          items: [
            { text: '基本用法', link: '/examples/basic' },
            { text: '配置选项', link: '/examples/configuration' }
          ]
        },
        {
          text: '功能示例 | Features',
          items: [
            { text: '重试示例', link: '/examples/retry' },
            { text: '缓存示例', link: '/examples/cache' },
            { text: '拦截器示例', link: '/examples/interceptors' }
          ]
        },
        {
          text: '实际应用 | Real World',
          items: [
            { text: 'RESTful API', link: '/examples/restful-api' },
            { text: '文件上传', link: '/examples/file-upload' },
            { text: '认证授权', link: '/examples/authentication' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Sunny-117/ureq' }
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present @ureq'
    },
    
    search: {
      provider: 'local'
    }
  }
}) 