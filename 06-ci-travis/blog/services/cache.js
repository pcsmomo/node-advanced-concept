const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
// client.get = util.promisify(client.get);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  // this._cache = true;  // either is fine
  this.useCache = true;
  // _hashKeyToUse  // any name is fine
  this.hashKey = JSON.stringify(options.key || '');

  return this;
};

// use function keyword, not arrow function for `this` behaviour
mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  // See if we have a value for 'key' in redis
  // const cachedValue = await client.get(key);
  const cachedValue = await client.hget(this.hashKey, key);

  // If we do, return that
  if (cachedValue) {
    console.log(`${this.mongooseCollection.name} - SERVING FROM CACHE`);

    // console.log(this);
    const doc = JSON.parse(cachedValue);

    return Array.isArray(doc)
      ? doc.map(d => new this.model(d)) // Hidrating Arrays
      : new this.model(doc); // Hydrating Object
  }

  // Otherwise, issue the query and store the result in redis
  const result = await exec.apply(this, arguments);

  console.log(`${this.mongooseCollection.name} - SERVING FROM MONGODB`);
  // client.set(key, JSON.stringify(result), 'EX', 10);
  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};
