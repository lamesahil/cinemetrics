import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://cnemetrics.onrender.com/api/movies';

export default function Dashboard() {
    const navigate = useNavigate();
    
    const [movies, setMovies] = useState([]);
    const [analytics, setAnalytics] = useState({ totalWatched: 0, averageRating: '--', topGenre: '--' });
    const [userName, setUserName] = useState('');
    
    // Form States
    const [title, setTitle] = useState('');
    const [rating, setRating] = useState('');
    const [isWatched, setIsWatched] = useState(false);
    const [formError, setFormError] = useState(''); // NEW: Error state for adding movies

    // Modal State
    const [movieToDelete, setMovieToDelete] = useState(null); // NEW: Custom Modal State

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/'); 
            return;
        }
        setUserName(localStorage.getItem('userName') || 'My');
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        try {
            const resAnalytics = await fetch(`${API_URL}/analytics`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dataAnalytics = await resAnalytics.json();
            if (dataAnalytics.success) setAnalytics(dataAnalytics.analytics);

            const resMovies = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dataMovies = await resMovies.json();
            if (dataMovies.success) setMovies(dataMovies.data);
        } catch (error) {
            console.error("Fetch failed:", error);
        }
    };

    const handleAddMovie = async (e) => {
        e.preventDefault();
        setFormError(''); // Reset error
        const token = localStorage.getItem('token');
        
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, rating: Number(rating), watched: isWatched })
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                setTitle('');
                setRating('');
                setIsWatched(false);
                fetchData(); 
            } else {
                // If backend throws error (e.g. missing genre, duplicate title), show it!
                setFormError(data.message || "Failed to add movie. Check backend schema.");
            }
        } catch (err) {
            console.error(err);
            setFormError("Server connection failed.");
        }
    };

    const toggleWatchStatus = async (id, currentStatus) => {
        if (currentStatus) return; 
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isWatched: true })
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const confirmDelete = async () => {
        if (!movieToDelete) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/${movieToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setMovieToDelete(null); // Close modal
                fetchData(); // Refresh list
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans relative">
            
            {/* NEW: Premium Custom Delete Modal */}
            {movieToDelete && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111111] border border-neutral-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-2">Delete Film?</h3>
                        <p className="text-neutral-400 text-sm mb-6">Are you sure you want to remove this from your library? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setMovieToDelete(null)} className="px-4 py-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors">CANCEL</button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors">DELETE</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`max-w-5xl mx-auto space-y-8 ${movieToDelete ? 'blur-sm pointer-events-none' : ''} transition-all`}>
                
                {/* Header Section */}
                <div className="flex justify-between items-center bg-[#111111] p-6 rounded-2xl border border-neutral-800 shadow-xl">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {userName}'s <span className="text-neutral-400">Watchlist</span>
                    </h1>
                    <button onClick={handleLogout} className="px-4 py-2 bg-red-950/30 text-red-500 hover:bg-red-900/40 rounded-lg text-sm font-bold transition-colors">
                        LOGOUT
                    </button>
                </div>

                {/* Analytics Grid */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-[#111111] border border-neutral-800 p-6 rounded-2xl flex flex-col justify-center items-center shadow-lg">
                        <span className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2">Total Watched</span>
                        <span className="text-4xl font-black">{analytics.totalWatched}</span>
                    </div>
                    <div className="bg-[#111111] border border-neutral-800 p-6 rounded-2xl flex flex-col justify-center items-center shadow-lg">
                        <span className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2">Avg Rating</span>
                        <span className="text-4xl font-black text-yellow-500">{analytics.averageRating}</span>
                    </div>
                    <div className="bg-[#111111] border border-neutral-800 p-6 rounded-2xl flex flex-col justify-center items-center shadow-lg">
                        <span className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2">Top Genre</span>
                        <span className="text-2xl font-black text-blue-400 truncate max-w-full">{analytics.topGenre}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Add Movie Form */}
                    <div className="md:col-span-1 h-fit bg-[#111111] border border-neutral-800 p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Add Film</h2>
                        
                        {/* Error Message Display */}
                        {formError && (
                            <div className="mb-4 p-3 bg-red-950/50 border border-red-900/50 text-red-500 text-xs font-medium rounded-lg">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleAddMovie} className="space-y-4">
                            <div>
                                <label className="block text-xs text-neutral-400 mb-1 uppercase tracking-wider">Title</label>
                                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white transition-colors" />
                            </div>
                            <div>
    <label className="block text-xs text-neutral-400 mb-1 uppercase tracking-wider">Rating (1-5)</label>
    <input 
        type="number" 
        min="1" 
        max="5" // Yahan 10 ko 5 kar diya
        step="0.1" 
        value={rating} 
        onChange={(e) => setRating(e.target.value)} 
        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white transition-colors" 
    />
</div>
                            <div className="flex items-center space-x-2 pt-2">
                                <input type="checkbox" id="watched" checked={isWatched} onChange={(e) => setIsWatched(e.target.checked)} className="w-4 h-4 bg-neutral-900 border-neutral-800 rounded accent-white" />
                                <label htmlFor="watched" className="text-sm font-medium text-neutral-300">Already Watched</label>
                            </div>
                            <button type="submit" className="w-full bg-white text-black font-bold rounded-lg px-4 py-3 mt-4 hover:bg-neutral-200 transition-colors">
                                + Add to List
                            </button>
                        </form>
                    </div>

                    {/* Movie List */}
                    <div className="md:col-span-2 bg-[#111111] border border-neutral-800 p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Your Library</h2>
                        {movies.length === 0 ? (
                            <p className="text-neutral-500 text-sm">No movies added yet. Start tracking!</p>
                        ) : (
                            <div className="space-y-3">
                                {movies.map((movie) => (
                                    <div key={movie._id} className="group flex justify-between items-center p-4 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl border border-transparent hover:border-neutral-700 transition-all">
                                        <div>
                                            <h3 className="font-bold text-lg">{movie.title} <span className="text-xs text-neutral-500 font-normal ml-2">{movie.releaseYear || ''}</span></h3>
                                            <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">{movie.genre?.join(', ')}</p>
                                        </div>
                                        
                                        <div className="flex items-center space-x-6">
                                            <div className="flex items-center space-x-3">
                                                <button onClick={() => toggleWatchStatus(movie._id, movie.isWatched)} className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-colors ${movie.isWatched ? 'bg-green-950/50 text-green-500 border border-green-900/50' : 'bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer'}`}>
                                                    {movie.isWatched ? 'Watched' : 'Pending'}
                                                </button>
                                                {movie.rating && <span className="text-yellow-500 font-bold text-sm">★ {movie.rating}</span>}
                                            </div>
                                            {/* Trigger Modal instead of Native Confirm */}
                                            <button onClick={() => setMovieToDelete(movie._id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}