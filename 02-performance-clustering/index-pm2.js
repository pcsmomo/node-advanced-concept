const express = require('express');
const crypto = require('crypto');
const app = express();

app.get('/', (req, res) => {
  const start = Date.now();
  crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    res.send('Hi there');
    console.log('/ end, ', Date.now() - start);
  });
});

app.get('/fast', (req, res) => {
  res.send('This was fast!');
});

app.listen(3000);
