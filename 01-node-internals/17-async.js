const https = require('https');

const start = Date.now();

// res is not a entire response. more complex and low level
https
  .request('https://www.google.com', (res) => {
    res.on('data', () => {});
    res.on('end', () => {
      console.log(Date.now() - start);
    });
  })
  .end();
