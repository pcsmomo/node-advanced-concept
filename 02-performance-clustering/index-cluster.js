// In real lieft, we would not want to use these basic clustering.
// Rather want to use a bettern open source solution such as PM2

process.env.UV_THREADPOOL_SIZE = 1;
const cluster = require('cluster');

// console.log(cluster.isMaster);
const serverStart = Date.now();
// Is the file being executed in master mode?
if (cluster.isMaster) {
  // Cause index.js to be executed *again* but in child mode
  console.log('Im a master');
  cluster.fork();
  cluster.fork();
  // cluster.fork();
  // cluster.fork();
  // cluster.fork();
  // cluster.fork();
} else {
  // Im an child, Im going to act like a server and do nothing else
  console.log('Im a child');
  const express = require('express');
  const crypto = require('crypto');
  const app = express();

  app.get('/', (req, res) => {
    const start = Date.now();
    // asynchronous Password-Based Key Derivation Function 2
    crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
      res.send('Hi there');
      console.log('/ end, ', Date.now() - start);
      console.log('/ end from server start, ', Date.now() - serverStart);
    });
  });

  app.get('/fast', (req, res) => {
    res.send('This was fast!');
  });

  app.listen(3000);
}
