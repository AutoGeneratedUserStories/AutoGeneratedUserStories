//models/user.ts
 
import mongoose from 'mongoose';
import { MongodbAdapter } from '@lucia-auth/adapter-mongodb';
 
interface User {
  password: string;
  username: string;
}
 
const UserSchema = new mongoose.Schema<User>({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  //. . . other fields
});
 
export default mongoose.models.User || mongoose.model<User>('User', UserSchema);
 
