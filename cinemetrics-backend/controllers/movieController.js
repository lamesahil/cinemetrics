import Movie from '../models/Movie.js';

// 🎬 ADD MOVIE
// THE SMART LIBRARIAN (Now with TMDB Auto-Fetch!)
export const addMovie = async (req, res) => {
    try {
        const { title, rating, watched } = req.body;

        // 1. TMDB ko call lagao
        const tmdbResponse = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(title)}`);
        const tmdbData = await tmdbResponse.json();

        if (!tmdbData.results || tmdbData.results.length === 0) {
            return res.status(404).json({ message: "Movie not found on TMDB!" });
        }

        const bestMatch = tmdbData.results[0]; 
        
        // 2. Exact Year Fix
        const fetchedYear = bestMatch.release_date ? Number(bestMatch.release_date.split('-')[0]) : null;

        // 3. TMDB Genre Dictionary (Numbers to Words translation)
        const genreMap = {
            28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 53: "Thriller", 10752: "War", 37: "Western"
        };
        // Shuru ke 2 genres nikal lo
        const fetchedGenres = bestMatch.genre_ids ? bestMatch.genre_ids.slice(0, 2).map(id => genreMap[id]).filter(Boolean) : ["Unknown"];

        // 4. Correct Database Schema Mapping 
        const newMovie = new Movie({
            title: bestMatch.title,
            releaseYear: fetchedYear,   // EXACT NAME MATCHED!
            genre: fetchedGenres,       // EXACT NAME MATCHED!
            rating: rating ? Number(rating) : 0,
            isWatched: watched || false, // EXACT NAME MATCHED!
            user: req.user.id
        });

        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);

    } catch (error) {
        console.error("Error adding movie:", error);
        res.status(500).json({ message: "Server error while auto-fetching data" });
    }
};
// 🎬 GET ALL MOVIES
export const getMovies = async (req, res) => {
    try {
        // Sirf wahi movies dhoondho jinka malik ye logged-in user hai
        const movies = await Movie.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: movies.length, data: movies });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 🎬 UPDATE MOVIE STATUS
export const updateMovieStatus = async (req, res) => {
    try {
        // Find movie by ID
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }

        // SECURITY CHECK: Kya ye movie ishi user ki hai? (Kisi aur ki movie update na kar de)
        if (movie.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this movie' });
        }

        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: updatedMovie });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 🎬 GET ANALYTICS
export const getAnalytics = async (req, res) => {
    try {
        // NOTE: $match stage sabse upar lagana zaroori hai taaki sirf is user ka data calculate ho!
        
        const totalWatched = await Movie.countDocuments({ user: req.user._id, isWatched: true });

        const avgRatingPipeline = await Movie.aggregate([
            { $match: { user: req.user._id, isWatched: true, rating: { $ne: null } } },
            { $group: { _id: null, avgRating: { $avg: "$rating" } } }
        ]);

        const topGenrePipeline = await Movie.aggregate([
            { $match: { user: req.user._id } },
            { $unwind: "$genre" },
            { $group: { _id: "$genre", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        res.status(200).json({
            success: true,
            analytics: {
                totalWatched,
                averageRating: avgRatingPipeline.length > 0 ? avgRatingPipeline[0].avgRating.toFixed(1) : 0,
                topGenre: topGenrePipeline.length > 0 ? topGenrePipeline[0]._id : "N/A"
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// THE ASSASSIN (Delete Movie)
export const deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: "Movie not found" });

        // Check permission: Sirf owner delete kar sakta hai
        if (movie.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await movie.deleteOne();
        res.status(200).json({ message: "Movie deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};