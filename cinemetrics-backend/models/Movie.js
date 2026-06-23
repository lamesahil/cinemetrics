import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
    // NAYA FIELD: Is movie ka malik kaun hai?
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Ye bata raha hai ki ye ID 'User' collection se aayegi
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    genre: {
        type: [String],
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    releaseYear: {
        type: Number
    },
    isWatched: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model('Movie', movieSchema);