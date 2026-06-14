const mongoose = require('mongoose');
const { mongoUri } = require('./env');

const connectDB = async () => {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log('MongoDB connected');
};

module.exports = connectDB;
