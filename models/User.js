import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: String
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;
