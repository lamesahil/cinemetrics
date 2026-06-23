import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    // Check kar rahe hain ki header mein 'Authorization' hai aur wo 'Bearer' se start hota hai
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token nikalna (Format hota hai: "Bearer token_xyz...")
            token = req.headers.authorization.split(' ')[1];

            // Token ko decode karke verify karna (Secret key se)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Token ke andar ID chhupi thi, us ID se user ka data nikal lo (par password mat nikalna)
            req.user = await User.findById(decoded.id).select('-password');

            // Bouncer bolta hai: "Sab sahi hai, aage badho!"
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    // Agar token bheja hi nahi
    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};