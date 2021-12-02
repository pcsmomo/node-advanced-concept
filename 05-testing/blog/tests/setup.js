require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

// Tell mongoose to use node global.Promise instead of mongoose.Promise
// (it's legacy code now, from Mongoose 5, this statement isn't needed)
// https://stackoverflow.com/questions/51862570/mongoose-why-we-make-mongoose-promise-global-promise-when-setting-a-mongoo
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true });
