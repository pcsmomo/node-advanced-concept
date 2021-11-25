const crypto = require('crypto');

// asynchronous Password-Based Key Derivation Function 2 
crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
  
});