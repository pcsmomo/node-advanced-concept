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

We will focus on "Integration Testing" \
Especially E2E (End to End), Automation testing

- Jest
- Chromium : "headless" version
  - Which is already included in node.js

### 72. Testing Challenges

1. Launch Chromium programatically and interact with it from a test suite
2. Make assertions in jest about stuff thats happening in a Chrome window
3. "Simulate" Logging in as a user? We're going through Google OAuth

### 73. Commands Around Testing

[npm peppeteer](https://www.npmjs.com/package/puppeteer)

- `"jest": "^22.1.4"`
- `"puppeteer": "^1.0.0"` : Puppeteer is a Node library which provides a high-level API to control Chrome or Chromium over the DevTools Protocol. Puppeteer runs headless by default, but can be configured to run full (non-headless) Chrome or Chromium.

```sh
npm test
```

### 75. Launching Chromium Instances

1. Pepperteer: Start up Chromium
2. Browser: Represents an open browser window
3. Page: Represents one individual tab

### 77. Extracting Page Content

Pepperteer, Browser, Page all works asynchronously

### 78. Puppeteer - Behind the Scenes

Jest - |different world| - Chromium

So the communication between Jest and Chromium is only with plain strings.\
and there serialising step behind the scenes

```js
await page.$eval('a.brand-logo', el => el.innerHTML);
```

`el => el.innerHTML` will be send as plain string, not as a function

### 81. Asserting OAuth Flow

[puppeteer DOC](https://github.com/puppeteer/puppeteer/blob/v12.0.1/docs/api.md)

- page.click()
- page.url()

### 82. Asserting URL Domain

[Jest expect.toMatch](https://jestjs.io/docs/expect#tomatchregexp--string)

### 83. Issues with OAuth

Google OAuth will consider these suspicious and get us CAPTCHA \
(Completely Automated Public Turing test to tell Computers and Humans Apart)

1. Chromium - never accessed it before and there will be many different Chromium instances
2. CI/CD testing

### 84. Solving Authentication Issues with Automation Testing

1. Make a secret route on the server that automatically logs in our Chromium browser
   - Bad practice to change our server code just to make our test suite work
2. When tests are running, don't require authentication of any kind
   - Server is running 100% separately from test suite. We can't easily change the server only when tests are running
3. Google might provide some fake accounts for testing
   - It works only for Google OAuth
4. \*Somehow convince our server that the Chromiun browser is logged into the app by faking a session
   - Let's try it!
   - It will work with any OAuth services, not only Google

### 85. The Google OAuth Flow

We will hook up these parts to our Chromium

- Server sets cookie on users browser that identifies them
- All feature requests include cookie data just identifies this user

### 86. Inner Workings of Sessions

See devTool, network tab when login via google OAuth

1. http://localhost:3000/auth/google/callback?code=4%2F0AX4XfWgZgpf507bO2vp94KzYgUW7Uq-ihvqhMk1y4GtNYzwKUKFyXKCQbjGMRdohJ7LvRQ&scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+openid&authuser=1&prompt=consent
   - Response Headers
     - set-cookies: session=eyJwYXNzcG9ydCI6eyJ1c2VyIjoiNjFhMzBmODkwMmVjNjMxYzA0NDZkMmU4In19; path=/; expires=Fri, 31 Dec 2021 20:09:05 GMT; httponly
     - set-cookies: session.sig=rHFEnnjJKe99pKyfbp1p6THMsGs; path=/; expires=Fri, 31 Dec 2021 20:09:05 GMT; httponly

```sh
# blog
node
const session = 'eyJwYXNzcG9ydCI6eyJ1c2VyIjoiNjFhMzBmODkwMmVjNjMxYzA0NDZkMmU4In19'
const Buffer = require('safe-buffer').Buffer;
Buffer.from(session, 'base64').toString('utf8');
# '{"passport":{"user":"61a30f8902ec631c0446d2e8"}}'
# The same user id(=mongodb id, not google id) in my mongodb
```

[safe-buffer npm](https://www.npmjs.com/package/safe-buffer)

So that 'session' value inside cookie is the key

### 87. Sessions From Another Angle

1. Create Page instance
2. Take an existing user ID and generate a fake session object with it
3. Sign in the sesion object with keygrip
4. Set the session and signature on our Page instance as cookies

### 88. Session Signatures

#### Session signature

session.sig : Session Signature

- Base64 Session + Cookie Signing Key = Session Signature
- Base64 Session = Cookie Signing Key + Session Signature

Our cookie key for development is located in config/dev.js

#### keygrip

[keygrip npm](https://www.npmjs.com/package/keygrip)

```sh
node
const session = 'eyJwYXNzcG9ydCI6eyJ1c2VyIjoiNjFhMzBmODkwMmVjNjMxYzA0NDZkMmU4In19';
const Keygrip = require('keygrip');
const keygrip = new Keygrip(['123123123111']);
keygrip.sign('session=' + session);
# rHFEnnjJKe99pKyfbp1p6THMsGs
# Exactly the same signature as we get from the browser
# keygrip.sign('asacvjkzxcvlakf' + session);
keygrip.verify('session=' + session, 'rHFEnnjJKe99pKyfbp1p6THMsGs')
# true
```

### 92. Factory Functions

- Session Factory
- User Factory

When we call it, it automately assembles some data and returns immediately

### 93. The Session Factory

```js
// mongoose id is actually an object
passport: {
  user: user._id.toString();
}
```

### 96. Global Jest Setup

```js
// Tell mongoose to use node global.Promise instead of mongoose.Promise
// (it's legacy code now, from Mongoose 5, this statement isn't needed)
// https://stackoverflow.com/questions/51862570/mongoose-why-we-make-mongoose-promise-global-promise-when-setting-a-mongoo
mongoose.Promise = global.Promise;
```

```json
// package.json
{
  "jest": {
    "setupTestFrameworkScriptFile": "./tests/setup.js"
  }
}
```

[Configuring Jest - DOC](https://jestjs.io/docs/configuration)

### 98. Adding a Login Method

[Page Class in Peppeteer - Github](https://github.com/puppeteer/puppeteer/blob/v12.0.1/src/common/Page.ts#L417)

We could use the same approach as same as our caching section\
But we're in an advanced course, so we will use a clever and more fun way\
with ES2015 syntax, `Proxy`

### 99. Extending Page

[example 99-extending-page.js](05-testing/examples/99-extending-page.js)

### 100. Introduction to Proxies

[Proxy - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

### 101. Proxies in Action

```js
// O, yup, this way with Proxy!
console.clear();

class Greetings {
  english() {
    return 'Hello';
  }
  spanish() {
    return 'Hola';
  }
}

class MoreGreetings {
  german() {
    return 'Hallo';
  }
  french() {
    return 'Bonjour';
  }
}

const greetings = new Greetings();
const moreGreetings = new MoreGreetings();

const allGreetings = new Proxy(greetings, {
  // target: greetings
  // property: string name of the property we try to access
  get: function (target, property) {
    return target[property] || moreGreetings[property];
    // return page[property] || customPage[property];
  }
});

console.log(allGreetings.french());
console.log(allGreetings.english());
```

```sh
npm test
```

### 102. Combining Object Property Access

[example 102-combine-object-property-access.js](05-testing/examples/102-combine-object-property-access.js)

### 105. Function Lookup Priority

The window didn't close\
because browser and page both have close()

### 111. Test Timeout

Timeout - Async callback was not invoked within the 5000ms timeout specified by jest.setTimeout.

```js
jest.setTimeout(30000);
```

### 116. Asserting Blog Creation

```js
await page.waitFor('.card'); // we should wait when navigating to the other page
```

> ⚠️TypeError: Cannot create property '\_called' on number '10' \
> This error message didn't show up When running test case one by one with `test.only`\
> But running all tests together, this warning occurs.\
> Could not find a clear answer. Guessing this lecture is a bit outdated.\
> Latest version of jest and puppeteer might not have this issue??\
> https://stackoverflow.com/questions/63226326/jest-with-puppeteer-typeerror-cannot-create-property-called-on-number-11

```js
"jest": "^22.1.4", -> "27.4.3"
"puppeteer": "^1.0.0" -> "12.0.1",
```

### 118. Direct API Requests

- [example 118-direct-api-requests.js](./05-testing/examples/118-direct-api-requests.js)
  - Test this script on the browser, both logged in and loggin out
- [fetch() options - MDN](https://developer.mozilla.org/en-US/docs/Web/API/fetch)

### 119. Executed Arbitrary JS in Chromium

[page.evaluate() - puppeteer DOC](https://github.com/puppeteer/puppeteer/blob/v12.0.1/docs/api.md#pageevaluatepagefunction-args)

### 123. Super Advanced Test Helpers

1. Create helpers `get` and `post`
   - ```js
      // evaluate takes args as only strings, so it will occur an error
      get(path) {
        return this.page.evaluate(() => {
          return fetch(path, {});
        })
      };
      ⬇️⬇️⬇️
      get(path) {
        return this.page.evaluate((_path) => {
          return fetch(_path, {});
        }, path)
      };
     ```
2. Create a helper `execRequests`
   - [Promise.all() - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

> Unfortunately,
> ⚠️TypeError: Cannot create property '\_called' on number '10' \
> When running all tests together, this warning message occurs.\
> But When running test case one by one with `test.only` or `describe.only`, all test pass\

## Section 6 - Wiring Up Continuous Integration

### 124. Introduction to CI

CI Flow

1. Developer pushes code to github
2. CI Server detects that a new push of code has occured
3. CI Server clones project to a cloud-based virtual machine
4. CI Server runs all tests (using a `.travis.yml`)
5. if all tests pass, CI Server marks build as 'passing' and does some optional followup
6. (option) Send an email, automatically deploy, put notification on Github, etc...

### 125. CI Providers

- [Travis CI](https://travis-ci.com/)
- Circle CI
- Codeship
- AWS Codebuild

### 126. The Basics of YAML Files

```yaml
# .yaml
languagesIKnow:
  english: 'very well'
  spanish: 'kindof'
countToTwo:
  - 'one'
  - 'two'
```

```json
// .json
{
  "languagesIKnow": {
    "english": "very well",
    "spanish": "kindof"
  },
  "countToTwo": ["one", "two"]
}
```

### 127. Travis YAML Setup

[Travis CI Documentation](https://docs.travis-ci.com)
[Travis CI API - DOC](https://docs.travis-ci.com/api)

trusty: a very specific version of linux (very small and suitable for small app)

```yaml
script:
  - nohup npm run start &
```

- nohup : no hang up, keep this command running.
  - if the shell is closed, dont kill anything this command creates
- npm run start
- & : Run this command in a subshell(in the background)

```sh
npm run start &
# Listening on port 5000
pkill node
# [1]  + terminated  npm run start
cal
# Calendar
```

### 131. Using Travis Documentation

Set up for MongDB, Express API and Redis Server

- [Setting up Databases and Services - DOC](https://docs.travis-ci.com/user/database-setup/)
- [Setting up MongoDB - DOC](https://docs.travis-ci.com/user/database-setup/#mongodb)
- [Setting up Redis - DOC](https://docs.travis-ci.com/user/database-setup/#redis)

### 132. More Server Configuration

1. Add ci.js key file
2. Fix redix URL in services/cache.js
3. Add redis URL to dev.js and ci.js
4. Add mongoDB URI to ci.js
5. Make sure server starts on port 3000 in CI mode
6. Make sure server serves react client files in CI mode

### 134. A Touch More Configuration

```js
// tests/helpers/page.js
// Set up for CI
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox'] // it will dramatically decrease amount of time to test
});
```

### 135. Git Repo Setup

1. Create github repository, `blog-node-ci`
2. Set github uri
   - `git remote add origin git@github.com:pcsmomo/blog-node-ci.git`

### 136. Travis CI Setup

Um... travis-ci.org -> travis-ci.com

1. Create a new account in Travis ci
   - it automatically connected my github account
2. Activate my repository, `blog-node-ci`

### 137. Triggering CI Builds

```sh
git add -A
git commit -m"travis config"
git push
```

Navigate travis-ci.com, we can see the pushed commit is processing

### 138. Build Success

All pased!!

```sh
Ran all test suites.
The command "npm run test" exited with 0.

store build cache     cache.2

Done. Your build exited with 0.
/home/travis/.travis/functions: line 536:  6084 Terminated              nohup npm run start

# Ran for 7 min 48 sec
# Caching takes the longest time
```

## Section 7 - Scalable Image/File Upload

### 140. Big Issues Around Image Upload

1. Where do images get physically stored?
   1. in MongoDB(cloud): too expensive for storing images (bad approach)
   2. in HD Attached to Server
   3. \*Outside Data Store
2. How do images _get_ to the place they should be stored?
3. How do we relate images to a particular blog post?

### 143. Upload Constraints

1. (Express API) Only signed in users should be able to upload
2. (Express API) The uploaded image needs to be tied to the blog posts that's being created
3. We should only allow images (.jpg, .png, etc) to be uploaded

### 144. Image File Transport

When I upload image via Express API, it will use a lot resource of the node server (CPU usage is going up rapidly)

### 145. Upload Flow with AWS S3

1. Client -> Server : Client tells server it needs to upload a file to S3. Includes file name and file type
2. Server -> AWS S3 : Server askes S3 for a presigned URL
3. AWS S3 -> Server : S3 gives server a presigned URL. Works "only" for a file matching the original file name
4. Server -> Client : Server sends url to React client
5. Client -> Server : React client uploads image file directly to s3 server
6. Server -> Client : React client tells server the upload was successful. Server saves URL of that new image with the blog post

## 152. AWS Credentials with IAM

IAM: Identity and Access Management

### 153. Creating S3 Buckets

S3 -> Create bucket -> `blogster-bucket-noah`

### 154. Allowing Actions with IAM Policies

- IAM -> Policies -> Create Policy
  - Service: S3
  - Actions: All S3 actions
  - Resources
    - Bucket -> Add ARN -> Bucket name : blogster-bucket-noah
    - Object -> Add ARN -> Bucket name: blogster-bucket-noah, Object name: Check Any
  - Review
    - name: `s3-blogster-bucket`
  - Create policy

### 155. Creating IAM Users

- IAM -> User
  - Add user
    - User name: `s3-blogster-bucket`
    - Access key - Programmatic access : check
  - Permissions
    - Attach existing policies directly
    - select s3-blogster-bucket
  - My "Access key ID" and "Secret access key" will be appealed

And save "accessKeyId" and "secretAccessKey" on config/dev.js

### 156. Upload Routes Files

```sh
npm install --save aws-sdk
# it was included already, "aws-sdk": "^2.188.0",
```

### 158. GetSignedURL Arguments

- [AWS SDK for JavaScript Documentation](https://docs.aws.amazon.com/sdk-for-javascript/index.html)
- [Version 2](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/index.html)
- [Version 3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html)

[AWS SDK S3 - getSignedUrl()](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property)

### 159. Calling GetSignedURL

```sh
npm install --save uuid
# "uuid": "^3.2.1" installed already
```

```js
app.get('/api/upload', requireLogin, (req, res) => {
  const key = `${req.user.id}/${uuid()}.jpeg`;

  s3.getSignedUrl(
    'putObject',
    {
      Bucket: 'blogster-bucket-noah',
      ContentType: 'jpeg',
      Key: key
    },
    (err, url) => res.send({ key, url })
  );
});
```

### 160. Viewing the Signed URL

Navigate `http://localhost:5000/api/upload`

### 161. Attempting Image Upload

CORS Error

Access to XMLHttpRequest at 'https://blogster-bucket-noah.s3.amazonaws.com/61abc0e87883a63b924a27c7/7658e8c0-56cf-11ec-936e-c12d647a5899.jpeg?AWSAccessKeyId=AKIAXQLRYDCS6OFMZNBX&Content-Type=image%2Fjpeg&Expires=1638821858&Signature=2%2FezCiUFt1dYC2f3DtwnyJVceMs%3D' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.

### 162. Handling CORS Errors

AWS S3 -> Buckets -> `blogster-bucket-noah` -> Permissions -> Cross-origin resource sharing (CORS)

[CORS configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html)

```xml
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <AllowedHeader>Authorization</AllowedHeader>
  </CORSRule>
  <CORSRule>
    <AllowedOrigin>http://localhost:3000</AllowedOrigin>
    <AllowedMethod>PUT</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <AllowedHeader>*</AllowedHeader>
  </CORSRule>
</CORSConfiguration>
```

```json
[
  {
    "AllowedHeaders": ["Authorization"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  },
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

And try to upload a image file

```
createError.js:16 Uncaught (in promise) Error: Request failed with status code 403
    at createError (createError.js:16)
    at settle (settle.js:18)
    at XMLHttpRequest.handleLoad (xhr.js:77)
```

> Damn... it accepts only 'jpeg', not 'png'. I was stuck here for 30 mins

### 164. S3 Bucket Policies

1. AWS S3 -> Buckets -> `blogster-bucket-noah` -> Permissions -> Block public access (bucket settings)
   - uncheck `Block all public access`
   - (optional) check `Block public access to buckets and objects granted through new access control lists (ACLs)`
   - (optional) check `Block public access to buckets and objects granted through any access control lists (ACLs)`
2. AWS S3 -> Buckets -> `blogster-bucket-noah` -> Permissions -> Bucket policy -> Edit -> Policy generator

- Select Type of Policy : S3 Bucket Policy
- Effect : Allow
- Principal: \*
- AWS Service : Amazon S3
- Actions : Check GetObject
- Amazon Resource Name (ARN): arn:aws:s3:::blogster-bucket-noah/\*
  - `/*` is at the end

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "Statement1",
			"Principal": {},
			"Effect": "Allow",
			"Action": [],
			"Resource": []
		}
	]
}
⬇️⬇️⬇️
{
  "Id": "Policy1638857854737",
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Stmt1638857849992",
      "Action": [
        "s3:GetObject"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::blogster-bucket-noah/*",
      "Principal": "*"
    }
  ]
}
```

Now the image is for public

https://blogster-bucket-noah.s3.ap-southeast-2.amazonaws.com/61abc0e87883a63b924a27c7/5d43f400-56d5-11ec-bce8-071d4a401e86.jpeg

### 166. Ensuring Images get Tied

we stored `imageUrl: uploadConfig.data.key`, which is folder/file name into the mongodb \
It is **a good practice not to store whole path**, in case we change our S3 bucket name and so on

</details>
