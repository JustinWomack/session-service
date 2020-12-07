import { Schema } from 'mongoose';

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
})

export default UserSchema;
