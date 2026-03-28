import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/generateToken.js';

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {
            res.status(400);
            throw new Error('Please add all fields');
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid user data' });
        }
        const AccessToken = await generateToken(user._id, '1m');
        const RefreshToken = await generateToken(user._id, '30d');


        user.password = undefined;

        res.cookie('refreshToken', RefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 30, sameSite: 'none' });

        res.status(201).json({ success: true, accessToken: AccessToken, user: user });
    } catch (error) {
        res.status(500);
        throw new Error(`Failed to register user: ${error.message}`);
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            res.status(400);
            throw new Error('Please add all fields');
        }
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            res.status(400);
            throw new Error('Invalid credentials');
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(400);
            throw new Error('Invalid credentials');
        }
        const AccessToken = await generateToken(user._id, '1h');
        const RefreshToken = await generateToken(user._id, '30d');
        res.cookie('refreshToken', RefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 30, sameSite: 'none' });
        user.password = undefined;
        res.status(200).json({ success: true, accessToken: AccessToken, user: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const logout = async (req, res) => {
    try {
        res.clearCookie('refreshToken');
        res.status(200).json({ success: true, user: {} });
    } catch (error) {
        res.status(500);
        throw new Error(`Failed to logout user: ${error.message}`);
    }
};


const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        console.log(refreshToken);
        if (!refreshToken) {
            res.status(401);
            throw new Error('Unauthorized');
        }
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        console.log('decoded', decoded);
        if (!decoded) {
            res.status(401);
            throw new Error('Unauthorized');
        }
        const user = await User.findById(decoded.id);
        if (!user) {
            res.status(401);
            throw new Error('Unauthorized');
        }
        const AccessToken = await generateToken(user._id, '1m');
        user.password = undefined;
        res.status(200).json({ success: true, accessToken: AccessToken, user: user });
    } catch (error) {
        res.status(500);
        throw new Error(`Failed to refresh token: ${error.message}`);
    }
};
export { register, login, logout, refreshToken };