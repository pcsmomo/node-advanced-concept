// To see crazy node behaviour

// process.env.UV_THREADPOOL_SIZE = 1;

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');

const start = Date.now();

function doRequest() {
  https
    .request('https://www.google.com', (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        console.log('HTTPS:', Date.now() - start);
      });
    })
    .end();
}

function doHash(num) {
  crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.log(`Hash-${num}:`, Date.now() - start);
  });
}

doRequest();

fs.readFile('21-multitask.js', 'utf8', () => {
  console.log('FS:', Date.now() - start);
});

doHash('1');
doHash('2');
doHash('3');
doHash('4');
