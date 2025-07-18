import mongoose, { Schema, Document, models } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role?: 'admin' | 'user'; // Optional: you can restrict routes based on role
  createdAt: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

export default models.User
  ? mongoose.model<IUser>('User')
  : mongoose.model<IUser>('User', UserSchema);
