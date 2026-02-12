import { Request } from '@ureq/core';
import { FetchRequestor } from '@ureq/impl-fetch';

// 创建一个基础的请求实例
const request = new Request(new FetchRequestor());

// GET 请求
request.get('https://suggest.taobao.com/sug?code=utf-8&q=%E5%8D%AB%E8%A1%A3&callback=cb').then((data) => {
    console.log(data);
}).catch(error => {
    console.error('Request failed:', error);
})

// GET 请求
request.get('https://jsonplaceholder.typicode.com/todos/1').then((data) => {
    console.log(data);
}).catch(error => {
    console.error('Request failed:', error);
})
