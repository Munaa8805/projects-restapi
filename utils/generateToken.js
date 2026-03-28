import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateToken = async (id, expiresIn) => {
    return await jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: expiresIn });
};

