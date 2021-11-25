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

pdkdf2 Function

Function in Node's 'crypto' library

- github.com/nodejs/node
  - lib: all javascript definitions
  - src: c++ implementation

[pdkdf2 in javascript side](https://github.com/nodejs/node/blob/master/lib/internal/crypto/pbkdf2.js)

```js
// These are C++ libraries
const { PBKDF2Job, kCryptoJobAsync, kCryptoJobSync } =
  internalBinding("crypto");
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

</details>
