import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// 🔑 Helper Function: Generate VIP Pass (JWT Token)
const generateToken = (id) => {
    // Ye token mein user ki ID chipkayega aur 30 din tak valid rahega
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// 📝 @desc    Register a new user
// 🚀 @route   POST /api/users/register
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // 1. Check kar: Kya ye email pehle se database mein hai?
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists!' });
        }

        // 2. Naya User create kar (Password automatic hash ho jayega pre-save hook ki wajah se)
        const user = await User.create({ name, email, password });

        // 3. User ban gaya toh usko data aur Token bhej do
        if (user) {
            res.status(201).json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// 🔓 @desc    Authenticate User & get token (Login)
// 🚀 @route   POST /api/users/login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Email se user dhoondh
        const user = await User.findOne({ email });

        // 2. Agar user mila AUR uska type kiya hua password database ke hashed password se match hua
        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            // Brutal Truth: Kabhi mat batao ki email galat hai ya password. Bol do "Invalid email or password" taaki hacker guess na kar paye.
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};