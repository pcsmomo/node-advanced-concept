# node-advanced-concept

Node JS: Advanced Concepts by Stephen Grider

## Folder structure

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
https.request('https://www.google.com', (res) => {});
```

### 18. Libuv OS Delegation

No matter how many async request we send, it all will take similar time to finish.

-> Some function calls in the stadard library such as 'https' delicated to OS. They handle those async work \

### 19. OS/Async Common Questions

That work is in the pendingOSTasks[], in event loop

### 21. Crazy Node Behavior

```sh
node 21-multitask.js
# HTTP: 428
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
# HTTP: 329
```

</details>
