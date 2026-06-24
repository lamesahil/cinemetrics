import Movie from '../models/Movie.js';

// 🎬 ADD MOVIE
// THE SMART LIBRARIAN (Now with TMDB Auto-Fetch!)
exports.addMovie = async (req, res) => {
    try {
        // Ab frontend se sirf naam, rating aur status aayega
        const { title, rating, watched } = req.body;

        // 1. TMDB API ko call lagao
        const tmdbResponse = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(title)}`);
        const tmdbData = await tmdbResponse.json();

        // 2. Agar movie nahi mili
        if (!tmdbData.results || tmdbData.results.length === 0) {
            return res.status(404).json({ message: "Movie not found on TMDB!" });
        }

        // 3. Best match (pehla result) uthao
        const bestMatch = tmdbData.results[0]; 
        
        // TMDB se exact saal nikaalo (e.g., "1999-10-15" se "1999")
        const fetchedYear = bestMatch.release_date ? bestMatch.release_date.split('-')[0] : "Unknown";

        // 4. Data ko apne MongoDB mein save karo (Ownership tag ke sath)
        const newMovie = new Movie({
            title: bestMatch.title, // TMDB ka official spelling
            year: fetchedYear,
            rating: rating || 0,
            watched: watched || false,
            user: req.user.id // Bouncer se aaya hua VIP Pass
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