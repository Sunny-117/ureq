# @ureq/playground

Interactive playground and demo collection for the @ureq HTTP request library.

## Overview

This playground demonstrates all the features and capabilities of the @ureq library through practical examples and interactive demos.

## Features Demonstrated

### 🔥 Basic HTTP Methods
- GET, POST, PUT, DELETE, PATCH requests
- Different implementations (Fetch vs Axios)
- Custom headers and query parameters

### ⚡ Advanced Features
- **Timeout Control**: Request timeout configuration
- **Automatic Retry**: Smart retry logic with customizable conditions
- **Request Caching**: Memory-based caching with TTL
- **Parallel Requests**: Concurrent request management
- **Idempotent Requests**: Request deduplication
- **Combined Features**: Using multiple features together

### 🔧 Interceptors
- Request interceptors for modifying outgoing requests
- Response interceptors for transforming responses
- Multiple interceptor chains
- Conditional interceptors
- Interceptor removal

### ❌ Error Handling
- 404 and network error handling
- Timeout error management
- Retry with error recovery
- Error interceptors
- Graceful fallback strategies
- Error type comparison between implementations

## Running the Demos

### Run All Demos
```bash
# From the root directory
pnpm playground

# Or run all demos
pnpm playground:demo
```

### Run Individual Demos
```bash
# From the playground directory
pnpm demo:basic        # Basic HTTP methods
pnpm demo:features     # Advanced features
pnpm demo:interceptors # Interceptor examples
pnpm demo:error-handling # Error handling patterns
```

## Demo Structure

```
src/
├── index.ts              # Main entry point
└── demos/
    ├── basic.ts          # Basic HTTP methods demo
    ├── features.ts       # Advanced features demo
    ├── interceptors.ts   # Interceptors demo
    └── error-handling.ts # Error handling demo
```

## Example Output

When you run the playground, you'll see detailed output showing:

- ✅ Successful operations with timing information
- 📊 Response data and metadata
- 🔍 Interceptor activity logs
- ❌ Error handling demonstrations
- 🚀 Performance comparisons (cache speedup, etc.)

## API Endpoints Used

The demos use [JSONPlaceholder](https://jsonplaceholder.typicode.com/) as a mock REST API for demonstration purposes. This provides:

- `/posts` - Blog post resources
- `/users` - User resources
- Predictable responses for testing

## Learning Path

1. **Start with Basic Demo** - Learn fundamental HTTP operations
2. **Explore Features Demo** - Understand advanced capabilities
3. **Study Interceptors Demo** - Learn request/response transformation
4. **Review Error Handling** - Master error management patterns

## Extending the Playground

To add new demos:

1. Create a new file in `src/demos/`
2. Export a `run*Demo()` function
3. Add the demo to `src/index.ts`
4. Add a script to `package.json`

## Dependencies

- `@ureq/core` - Core request functionality
- `@ureq/impl-fetch` - Fetch-based implementation
- `@ureq/impl-axios` - Axios-based implementation
- `tsx` - TypeScript execution
- `typescript` - TypeScript compiler
