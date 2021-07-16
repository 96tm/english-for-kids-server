import mongoose from 'mongoose';

interface IUser {
  login: string;
  hash: string;
}

const userSchema = new mongoose.Schema<IUser>({
  login: { type: String, maxlength: 30 },
  hash: { type: String, maxlength: 100 },
});

export const UserModel = mongoose.model<IUser>('User', userSchema);
