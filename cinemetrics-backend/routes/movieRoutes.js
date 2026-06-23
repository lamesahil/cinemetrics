import express from 'express';
import { addMovie, getMovies, updateMovieStatus, getAnalytics } from '../controllers/movieController.js';
// 1. Apne Bouncer ko bulao
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// 2. Har route ke aage 'protect' laga do
router.post('/', protect, addMovie);
router.get('/', protect, getMovies);
router.get('/analytics', protect, getAnalytics);
router.patch('/:id', protect, updateMovieStatus);

export default router;