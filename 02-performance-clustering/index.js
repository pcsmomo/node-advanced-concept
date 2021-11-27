const cluster = require('cluster');

// console.log(cluster.isMaster);

// Is the file being executed in master mode?
if (cluster.isMaster) {
  // Cause index.js to be executed *again* but in child mode
  console.log('Im a master');
  cluster.fork();
  // cluster.fork();
  // cluster.fork();
  // cluster.fork();
} else {
  // Im an child, Im going to act like a server and do nothing else
  console.log('Im a child');
  const express = require('express');
  const app = express();

  function doWork(duration) {
    const start = Date.now();
    while (Date.now() - start < duration) {}
  }

  app.get('/', (req, res) => {
    doWork(5000); // Server cannot do any other thing for 5s
    res.send('Hi there');
  });

  app.get('/fast', (req, res) => {
    res.send('This was fast!');
  });

  app.listen(3000);
}
