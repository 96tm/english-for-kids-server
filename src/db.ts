import mongoose from 'mongoose';

import { MONGO_CONNECTION_STRING } from './config';

const mongoDB = MONGO_CONNECTION_STRING;

(async function runDb(): Promise<void> {
  try {
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    await mongoose.connect(mongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error('connection error', err);
  }
})();
