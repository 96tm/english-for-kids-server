import mongoose from 'mongoose';

interface IUser {
  login: string;
  password: string;
}

const userSchema = new mongoose.Schema<IUser>({
  login: { type: String, maxlength: 30 },
  password: { type: String, maxlength: 30 },
});

export const UserModel = mongoose.model<IUser>('User', userSchema);
