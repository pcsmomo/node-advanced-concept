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

app.listen(3000);
