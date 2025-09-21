import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

console.log('✅ Imports successful!');
console.log('Request:', typeof Request);
console.log('FetchRequestor:', typeof FetchRequestor);

// Test basic instantiation
const requestor = new FetchRequestor();
const request = new Request(requestor);

console.log('✅ Instantiation successful!');
console.log('Request instance:', request.constructor.name);
