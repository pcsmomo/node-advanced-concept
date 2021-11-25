const crypto = require('crypto');
const { performance } = require('perf_hooks');

// const start = Date.now();
const start = performance.now();

// asynchronous Password-Based Key Derivation Function 2
crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
  console.log('1:', performance.now() - start);
});

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
  console.log('2:', performance.now() - start);
});
