import mongoose from 'mongoose';

import bcrypt from 'bcryptjs';


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [30, 'Name must be less than 30 characters long'],
        minlength: [3, 'Name must be at least 3 characters long'],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    password: {
        type: String,
        required: true,
        minlength: [3, 'Password must be at least 3 characters long'],
        trim: true,
    },
    accessToken: {
        type: String,
        default: '',
    },
    refreshToken: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    role: {
        type: String,
        default: 'user',
    },
}, {
    timestamps: true,
});

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model('User', UserSchema);

export default User;