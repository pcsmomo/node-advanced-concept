# node-advanced-concept

Node JS: Advanced Concepts by Stephen Grider

## Folder structure

- 03-project-setup
  - blog : main project
- After that blog project is copied from the previous lecture
  - and so is /config/dev.js as it is not included to git

# Details

<details open> 
  <summary>Click to Contract/Expend</summary>

## Section 1 - The Internals of Node

### 4. Starting With Node Internals

1. Node JS allows us to use only JS, not C++ (those Engines are inculded C++)
   - Javascfript Code We Write: 100% JS
     - Node JS: 50% JS, 50% C++
       - V8: 30% JS, 70% C++
       - libuv: 100% C++
2. Node JS includes useful libraries
   - Actually, most these are implemented in `libuv`
   - http
   - fs
   - crypto
   - path

### 5. Module Implementations

1. Pick a function in Node standard library
2. Find where its implemented in the Node source code
3. See how V8 and libuv are used to implement that function

pdkdf2 Function: asynchronous Password-Based Key Derivation Function 2

Function in Node's 'crypto' library

- github.com/nodejs/node
  - lib: all javascript definitions
  - src: c++ implementation

[pdkdf2 in javascript side](https://github.com/nodejs/node/blob/master/lib/internal/crypto/pbkdf2.js)

```js
// These are C++ libraries
const { PBKDF2Job, kCryptoJobAsync, kCryptoJobSync } =
  internalBinding('crypto');
```

### How node js works

1. Javascript Code We Write
2. Node's Javascript Side
   - (lib folder in Node repository)
   1. process.binding -> internalBinding
      - connects JS and C++ functions
   2. V8
      - Converts values between JS and C++ world
3. Node's C++ Side
   - (src folder in Node Repo)
4. libuv
   - Gives Node easy access to underlying OS

### 6. Node Backed by C++!

- [pdkdf2 in c++ side](https://github.com/nodejs/node/blob/master/src/node_crypto.cc)
- [pdkdf2 in c++ side](https://github.com/nodejs/node/blob/master/src/crypto/crypto_scrypt.cc)
  - `using v8::[]` This is where v8 engine comes in the play
  - `uv_xxxx`: (libuv) concurrency and processing on c++ side

### 8. The Node Event Loop

- Node Program
  - One Thread
    - Event Loop

### 11. Is Node Single Threaded?

- Node _Event Loop_ -> Single Threaded
- Some of Node _Frameworks/Standard libraries_ -> Not Single Threaded

### 13. The Libuv Thread Pool

Libuv - Threadpool - 4 threads

### 14. Threadpools with Multithreading

With my laptop 2015 Macbook Pro which has dual core cpu

Thread Pool (total 4 thread) -> OS Thread Scheduler -> 2 cores

| (2core/4thread) | 1 phase(ms) | 2 phase(ms) | 3 phase(ms) |
| :-------------: | :---------: | :---------: | :---------: |
|     1 work      |   1: 641    |             |             |
|     2 works     |   2: 679    |             |             |
|                 |   1: 688    |             |             |
|     3 works     |   3: 1109   |             |             |
|                 |   2: 1139   |             |             |
|                 |   1: 1154   |             |             |
|     4 works     |   4: 1385   |             |             |
|                 |   1: 1398   |             |             |
|                 |   2: 1418   |             |             |
|                 |   3: 1421   |             |             |
|     5 works     |   4: 1384   |   5: 2096   |             |
|                 |   1: 1432   |             |             |
|                 |   3: 1442   |             |             |
|                 |   2: 1448   |             |             |
|     6 works     |   1: 1348   |   5: 2030   |             |
|                 |   4: 1385   |   6: 2047   |             |
|                 |   2: 1400   |             |             |
|                 |   3: 1403   |             |             |
|    10 works     |   1: 1475   |   5: 2938   |   9: 3651   |
|                 |   2: 1485   |   6: 2944   |  10: 3657   |
|                 |   4: 1485   |   7: 2949   |             |
|                 |   3: 1493   |   8: 2954   |             |

### 15. Changing Threadpool Size

`process.env.UV_THREADPOOL_SIZE = 2;`

| (2core/2thread) | 1 phase(ms) | 2 phase(ms) | 3 phase(ms) |
| :-------------: | :---------: | :---------: | :---------: |
|     5 works     |   2: 707    |   3: 1418   |   5: 2069   |
|                 |   1: 733    |   4: 1433   |             |

`process.env.UV_THREADPOOL_SIZE = 5;`

| (2core/2thread) | 1 phase(ms) | 2 phase(ms) | 3 phase(ms) |
| :-------------: | :---------: | :---------: | :---------: |
|     5 works     |   4: 1746   |             |             |
|                 |   1: 1759   |             |             |
|                 |   5: 1759   |             |             |
|                 |   2: 1760   |             |             |
|                 |   3: 1764   |             |             |

### 16. Common Threadpool Questions

1. Can we use the threadpool for javascript code or can only nodeJS functions use it?
   - We can write custom JS that uses thread pool (We will see in a few lectures)
2. What functions in node std library use the threadpool?
   - all 'fs' module functions. Some crypto stuff. Depends on OS (windows vs unix based)
3. How does this threadpool stuff fit into the event loop
   - Tasks running in the threadpool are the 'pendingOperations' in our code example

### 17. Explaining OS Operations

```js
// res is not a entire response. more complex and low level
https.request('https://www.google.com', res => {});
```

### 18. Libuv OS Delegation

No matter how many async request we send, it all will take similar time to finish.

-> Some function calls in the stadard library such as 'https' delicated to OS. They handle those async work \

### 19. OS/Async Common Questions

That work is in the pendingOSTasks[], in event loop

### 21. Crazy Node Behavior

```sh
node 21-multitask.js
# HTTPS: 428
# Hash: 1367
# FS: 1372
# Hash: 1378
# Hash: 1381
# Hash: 1412
```

```sh
# Without Hash
node 21-multitask.js
# FS: 23
# HTTPS: 329
```

### 22. Unexpected Event Loop Events

- FS module - Threadpool
- HTTPS - OS (outside of Threadpool)

#### How fs works

1. We call fs.readFile
2. Node gets some 'stats' on the file (requires HD access)
3. **HD accessed, stats returned**
4. Node requests to read the file
5. **HD accessed, file contents streamed back to app**
6. Node returns file contents to us

> It was about the number of Threadpool

| Threadpool |   1    |   2    |   3    |     |
| :--------: | :----: | :----: | :----: | :-: |
|  Thread#1  |   FS   | Hash#4 | Hash#4 |     |
|  Thread#2  | Hash#1 | Hash#1 |   FS   |     |
|  Thread#3  | Hash#2 | Hash#2 | Hash#2 |     |
|  Thread#4  | Hash#3 | Hash#3 | Hash#3 |     |
|  waiting   | Hash#4 |   FS   |        |     |

1. FS access HD to get stats
2. while FS is wasting, Hash#4 got occupied to Thread#1
   - and Hash#1 in Thread#2 finished and printed
3. FS got in Thread#2 and finished its job (actually very quick)
4. Hash#2, Hash#3, Hash#4 finished

```sh
# process.env.UV_THREADPOOL_SIZE = 5;
node 21-multitask.js
# FS: 50
# HTTPS: 387
# Hash-3: 1515
# Hash-1: 1524
# Hash-2: 1542
# Hash-4: 1564
```

```sh
# process.env.UV_THREADPOOL_SIZE = 1;
node 21-multitask.js
# HTTPS: 386
# Hash-1: 678
# Hash-2: 1322
# Hash-3: 1968
# Hash-4: 2609
# FS: 2610
```

## Section 2 - Enhancing Node Performance

### 23. Enhancing Performance

Improving Node Performance

1. Use Node in 'Cluster' Mode : Recommended
2. Use Worker Threads : Experimental

> Clustering kind of makes node works like it does multi-threading

### 24. Express Setup

```sh
npm init -y
npm install --save express
node index.js
```

> nodemon doesn't work well with clustering \
> So we won't use it

### 25. Blocking the Event Loop

When trying to open localhost:3000 in two tabs, we takes 10s as the server is running doWork(5000) twice.

### 28. Clustering in Action

```js
const cluster = require('cluster');
console.log(cluster.isMaster);
cluster.fork();
```

1. isMaster is true at the first.
2. when `cluster.fork();` it will run index.js once again and this time `cluster.isMaster` is false

### 29. Benchmarking Server Performance

```js
cluster.fork();
cluster.fork();
cluster.fork();
cluster.fork();
```

When it has several instances(?) and navigate a different path, the server will work parallelly

### 29. Benchmarking Server Performance

with one `cluster.fork();`

[Apache Benchmark](https://httpd.apache.org/docs/2.4/programs/ab.html)

```sh
# In a new terminal tab, (macOS)
# using ab (apache benchmark)
# -c concurrency, -n requests
ab -c 50 -n 500 localhost:3000/fast
# Requests per second:    936.70 [#/sec] (mean)
# Time per request:       53.379 [ms] (mean)
# Percentage of the requests served within a certain time (ms)
#   50%     49
#   66%     53
#   75%     55
#   80%     56
#   90%     59
#   95%     61
#   98%     64
#   99%     64
#  100%     65 (longest request)
```

### 31. Need More Children!

```sh
ab -c 1 -n 1 localhost:3000/
# Time taken for tests:   0.676 seconds

ab -c 2 -n 2 localhost:3000/
# Time taken for tests:   1.301 seconds

ab -c 6 -n 6 localhost:3000/
```

> the most efficient way to set clusters is \
> to match the number of of clusters and the number of the cpu core (physical or logical) \
> if the clusters are more than your core count, it will give you a negative result

### 32. PM2 Installation

> In real life, we would not want to use these basic clustering.\
> Rather want to use a bettern open source solution such as PM2

- [PM2 - github](https://github.com/Unitech/pm2)
- [PM2 Documents](https://pm2.keymetrics.io/docs/usage/quick-start/)
- process manager for Node.js applications with a built-in load balancer

```sh
npm install -g pm2
```

### 33. PM2 Configuration

> PM2 is excellent for a production

```sh
# -i 0 : pm2 will figure it out how many clusters are better
pm2 start index-pm2.js -i 0

pm2 kill index-pm2
pm2 list
pm2 show index-pm2
pm2 monit
pm2 delete index-pm2
```

### 34. Webworker Threads

worker threads is still in the experimental stage \
So use 'Cluster' mode

[WebWorker Threads](https://www.npmjs.com/package/webworker-threads)

```sh
npm install --save webworker-threads
# Failed to install webworker-threads@0.7.17 which was published 3 years ago
```

### 36. Benchmarking Workers

```sh
node index-worker-threads.js
ab -c 1 -n 1 localhost:3000/
```

```js
worker.onmessage = function (message) {
  console.log(message.data);
  // If we send "Number" type, res thinks it is a status code.
  // So convert it to "String"
  res.send('' + message.data);
};
```

## Section 3 - Project Setup

### 38. Project Walkthrough

- [Advanced Node Starter](https://github.com/StephenGrider/AdvancedNodeStarter)
- [Advanced Node Compelte](https://github.com/StephenGrider/AdvancedNodeComplete)

> I had a trouble with mongodb connection, but it turns out \
> I didn't follow the instruction, Stephen wrote on

1. mondo db
   - the password should be the created user's password, not mongo atlas account
   - database name should be `blog_dev`
   - driver version is `2.2.12 or later`
2. (optional) Google client ID and secret key
   - It's optional because I can just use Stephen's credential
   - But if I want to use mine,
   - https://console.cloud.google.com/apis/credentials?authuser=1&project=typescript-study-300509
     - Create Credentails
     - OAuth client ID
     - \*Add Authorized redirect URIs
       - http://localhost:3000/auth/google/callback

## Section 4 - Data Caching with Redis

### 43. MongoDB Query Performance

- Usually \_id has its own index
- But for the other keys, we need to create more indexes
  - It takes resources e.g. it takes memory and it'd be slower when writing
- So, the other solution for query performance is caching

### 45. Redis Introduction

[node-redix npm](https://www.npmjs.com/package/redis)

### 46. Installing Redis on MacOS

```sh
brew install redis
brew services restart redis

# check if it works
redis-cli ping
# PONG
```

### 48. Getting and Setting Basic Values

```sh
# /blog
node
> const redis = require('redis')
> const redisUrl = 'redis://127.0.0.1:6379'
> const client = redis.createClient(redisUrl)
> client
> client.set('hi', 'there')
> client.get('hi', (err, value) => console.log(value))
# there
> client.get('hi', console.log)
```

### 49. Redis Hashes

```js
{
   'spanish': {
      'red': 'rojo'
   },
   'german': {
      'red': 'rot'
   },
}
```

```sh
node
> client.hset('german', 'red', 'rot');
> client.hget('german', 'red', console.log);
```

### 50. One Redis Gotcha

Redis stores only 'String' or 'Number' types. Not objects.

```sh
node
> client.set('colors', JSON.stringify({ red: 'rojo' }));
> client.get('colors', console.log);
# null '{"red":"rojo"}'    # String
> client.get('colors', (err, val) => console.log(JSON.parse(val))));
# { red: 'rojo' }          # Object
```

### 52. Promisifying a Function

[node util.promisify(original)](https://nodejs.org/api/util.html#utilpromisifyoriginal)

```js
// Redis initialising
const redis = require('redis');
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);

// node standard library
const util = require('util');
// promisiy: call back to return Promise
client.get = util.promisify(client.get);

// Are these different?
// const cachedBlogs = client.get(req.user.id, (err, reply) => reply);
const cachedBlogs = await client.get(req.user.id);
```

### 53. Caching in Action

```sh
node
client.flushall()
```

### 55. The Ultimate Caching Solution

[Customising Query - mongoose Doc](https://mongoosejs.com/docs/queries.html)

1. Caching code isn't easily reusable anywhere else in our codebase
   - Hook in to Mongooses's query generation and execution process

```js
// Using query builder
const query Person.
  find({ occupation: /host/ }).
  where('name.last').equals('Ghost').
  where('age').gt(17).lt(66).
  where('likes').in(['vaporizing', 'talking']).
  limit(10).
  sort('-occupation').
  select('name occupation');

// Check to see if this query has already been fetched in redis
query.exec(callback);
// Same as...
// Behind the scene, it use .exec()
query.then(result => console.log(result))
// Same as...
const result = await query;
```

```js
// Hijack exec() for caching
query.exec = function () {
  // to check to see if this query has already been executed
  // and if it has return the result right away
  const result = client.get('query key');
  if (result) {
    return result;
  }

  // otherwise issue the query *as normal*
  const result = runTheOriginalExecFunction();

  // then save that value in redis
  client.set('query key', result);

  return result;
};
```

2. Cached values never expired
   - Add timeout to values assigned to redis. Also add ability to reset all values tied to some specific event

```sh
node
# expired after 5 seconds
client.set('color', 'red', 'EX', 5)
```

3. Cache keys won't work when we introduce other collections or query options
   - Figure out a more robust solution for generating cache keys

[query.getOptions() - DOC](https://mongoosejs.com/docs/api.html#query_Query-getOptions)

```sh
query.getOptions();
```

### 56. Patching Mongoose's Exec

All queries creates new Query \
`Blog.find({ _user: req.user.id });`

[mongoose query - Github](https://github.com/Automattic/mongoose/blob/master/lib/query.js)

```js
// [In the](https://github.com/Automattic/mongoose/blob/master/lib/query.js)
Query.prototype = new mquery();
Query.prototype.constructor = Query;
Query.base = mquery.prototype;

Query.prototype.toConstructor = function toConstructor() {};

Query.prototype.find = function (conditions, callback) {};

Query.prototype.exec = function exec(op, callback) {};
```

```js
// Patching the original exec()
const mongoose = require('mongoose');
const exec = mongoose.Query.prototype.exec;

// use function keyword, not arrow function for `this` behaviour
mongoose.Query.prototype.exec = function () {
  console.log('IM ABOUT TO RUN A QUERY');
  return exec.apply(this, arguments);
};
```

### 67. Forced Cache Expiration

set redis key for a specific user, so the cache for 'users' and 'blogs' can be expired together

## Section 5 - Automated Headless Browser Testing

### 71. Testing Flow

</details>
