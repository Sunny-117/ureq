import { Request as UreqRequest } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';
import { AxiosRequestor } from '@ureq/impl-axios';

// Mock API endpoints for demonstration
const MOCK_API_BASE_BASIC = 'https://jsonplaceholder.typicode.com';

async function runBasicDemo() {
  console.log('🔥 Basic HTTP Methods Demo\n');

  // Demo with Fetch implementation
  console.log('📡 Using Fetch Implementation:');
  const fetchRequest = new UreqRequest(new FetchRequestor({
    baseURL: MOCK_API_BASE_BASIC
  }));

  try {
    // GET request
    console.log('  GET /posts/1');
    const post = await fetchRequest.get('/posts/1');
    console.log('  ✅ Response:', { id: post.id, title: post.title.substring(0, 30) + '...' });

    // POST request
    console.log('  POST /posts');
    const newPost = await fetchRequest.post('/posts', {
      title: 'Demo Post from @ureq',
      body: 'This is a demo post created using @ureq library',
      userId: 1
    });
    console.log('  ✅ Created post with ID:', newPost.id);

    // PUT request
    console.log('  PUT /posts/1');
    const updatedPost = await fetchRequest.put('/posts/1', {
      id: 1,
      title: 'Updated Demo Post',
      body: 'This post has been updated using @ureq PUT method',
      userId: 1
    });
    console.log('  ✅ Updated post:', { id: updatedPost.id, title: updatedPost.title.substring(0, 30) + '...' });

    // PATCH request
    console.log('  PATCH /posts/1');
    const patchedPost = await fetchRequest.patch('/posts/1', {
      title: 'Patched Title'
    });
    console.log('  ✅ Patched post:', { id: patchedPost.id, title: patchedPost.title });

    // DELETE request
    console.log('  DELETE /posts/1');
    await fetchRequest.delete('/posts/1');
    console.log('  ✅ Post deleted successfully');

  } catch (error) {
    console.error('  ❌ Fetch demo error:', error);
  }

  // Demo with Axios implementation
  console.log('\n📡 Using Axios Implementation:');
  const axiosRequest = new UreqRequest(new AxiosRequestor({
    baseURL: MOCK_API_BASE_BASIC
  }));

  try {
    // GET request with query parameters
    console.log('  GET /posts?userId=1');
    const userPosts = await axiosRequest.get('/posts', {
      params: { userId: 1 }
    });
    console.log(`  ✅ Found ${userPosts.length} posts for user 1`);

    // POST with custom headers
    console.log('  POST /posts (with custom headers)');
    const postWithHeaders = await axiosRequest.post('/posts', {
      title: 'Post with Custom Headers',
      body: 'This post was created with custom headers',
      userId: 2
    }, {
      headers: {
        'X-Custom-Header': 'demo-value',
        'Content-Type': 'application/json'
      }
    });
    console.log('  ✅ Created post with custom headers, ID:', postWithHeaders.id);

  } catch (error) {
    console.error('  ❌ Axios demo error:', error);
  }

  console.log('\n✅ Basic demo completed!\n');
}

export { runBasicDemo };

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBasicDemo().catch(console.error);
}
