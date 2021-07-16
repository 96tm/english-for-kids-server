import mongoose from 'mongoose';

import { MONGO_CONNECTION_STRING, SALT_ROUNDS } from './config';
import { UserModel } from './resources/user/User';

import bcrypt from 'bcrypt';

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
    await createAdmin();
  } catch (err) {
    console.error('connection error', err);
  }
})();

async function createAdmin(): Promise<void> {
  const admin = await UserModel.findOne({ login: 'admin' });
  if (!admin) {
    const hash = await bcrypt.hash('admin', SALT_ROUNDS);
    const createdAdmin = new UserModel({ login: 'admin', hash });
    await createdAdmin.save();
  }
}
