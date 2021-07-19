import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { MONGO_CONNECTION_STRING, SALT_ROUNDS } from './config';
import { UserModel } from './resources/user/User';

(async function runDb(): Promise<void> {
  try {
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose.set('useUnifiedTopology', true);
    await mongoose.connect(MONGO_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await createAdmin();
  } catch (err) {
    console.error('Connection error', err);
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
