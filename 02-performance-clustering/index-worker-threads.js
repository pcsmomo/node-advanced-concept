const express = require('express');
const crypto = require('crypto');
const app = express();
const Worker = require('webworker-threads').Worker;

app.get('/', (req, res) => {
  const worker = new Worker(function () {
    this.onmessage = function () {
      let counter = 0;
      // 1e9 = 1,000,000,000
      while (counter < 1e9) {
        counter++;
      }
      postMessage(counter);
    };
  });

  worker.onmessage = function (message) {
    console.log(message.data);
    // If we send "Number" type, res thinks it is a status code.
    // So convert it to "String"
    res.send('' + message.data);
  };

  worker.postMessage();
});

app.get('/fast', (req, res) => {
  res.send('This was fast!');
});

app.listen(3000);
