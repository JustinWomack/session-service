import mongoose, { Model, Document } from 'mongoose';
import { UserSchema } from '../schema';

export interface iUser {
    username: string;
    password: string;
}

export type tUserDocument = Document & iUser;

export interface iUserModel extends Model<tUserDocument> {

}

const UserModel: iUserModel = mongoose.model<tUserDocument, iUserModel>('User', UserSchema, 'user');

export default UserModel;
