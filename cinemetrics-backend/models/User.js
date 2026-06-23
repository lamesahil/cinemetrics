import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true // Ek email se ek hi account banega
    },
    password: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

// Mongoose Hook: Save hone se pehle password ko Hash karo
userSchema.pre('save', async function(next) {
    // Agar password change nahi hua hai, toh aage badho
    if (!this.isModified('password')) {
        next();
    }
    
    // Salt generate karo (security layer) aur hash banao
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Custom Method: Login ke waqt password match karne ke liye
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);