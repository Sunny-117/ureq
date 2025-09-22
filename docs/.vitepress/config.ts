import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ureq',
  description: '模块化、可扩展的 HTTP 请求库 | A modular and extensible HTTP request library',
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '指南 | Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '示例 | Examples', link: '/examples/basic' },
      { 
        text: '更多 | More',
        items: [
          { text: 'Changelog', link: 'https://github.com/Sunny-117/request/blob/main/CHANGELOG.md' },
          { text: 'Contributing', link: 'https://github.com/Sunny-117/request/blob/main/CONTRIBUTING.md' }
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
            { text: '超时处理', link: '/guide/features/timeout' },
            { text: '自动重试', link: '/guide/features/retry' },
            { text: '请求缓存', link: '/guide/features/cache' },
            { text: '并发控制', link: '/guide/features/parallel' },
            { text: '幂等性保证', link: '/guide/features/idempotent' }
          ]
        },
        {
          text: '进阶指南 | Advanced',
          items: [
            { text: '拦截器', link: '/guide/advanced/interceptors' },
            { text: '自定义请求器', link: '/guide/advanced/custom-requestor' }
          ]
        }
      ],
      '/api/': [
        {
          text: '核心 API | Core',
          items: [
            { text: 'Request', link: '/api/core/request' },
            { text: 'Interceptor', link: '/api/core/interceptor' }
          ]
        },
        {
          text: '实现 | Implementations',
          items: [
            { text: 'Fetch', link: '/api/implementations/fetch' },
            { text: 'Axios', link: '/api/implementations/axios' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Sunny-117/request' }
    ]
  }
}) 