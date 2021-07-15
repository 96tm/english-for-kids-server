import mongoose from 'mongoose';

import { MONGO_CONNECTION_STRING } from './config';

const mongoDB = MONGO_CONNECTION_STRING;

(async function runDb(): Promise<void> {
  try {
    await mongoose.connect(mongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error('connection error', err);
  }
})();
