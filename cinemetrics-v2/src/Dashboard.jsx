import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const API_URL = 'https://cnemetrics.onrender.com/api/movies';

// --- 3D Clapperboard Model ---
function ClapperboardModel() {
    const { scene } = useGLTF('/cc0_-_clapperboard.glb');
    const modelRef = useRef();
    const targetRotation = useRef({ x: 0, y: 0 });

    useFrame((state) => {
        if (!modelRef.current) return;
        targetRotation.current.x = state.pointer.y * 0.3;
        targetRotation.current.y = state.pointer.x * 0.5;
        modelRef.current.rotation.x = THREE.MathUtils.lerp(modelRef.current.rotation.x, targetRotation.current.x, 0.02);
        modelRef.current.rotation.y = THREE.MathUtils.lerp(modelRef.current.rotation.y, targetRotation.current.y, 0.02);
        modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.12 - 0.2;
    });

    return <primitive ref={modelRef} object={scene} scale={3.4} position={[0, -0.2, 0]} />;
}

// --- 3D Background Canvas ---
function SceneBackground() {
    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[#050505]">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true }}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 10]} intensity={3} color="#ffffff" castShadow />
                <directionalLight position={[-5, 5, -5]} intensity={1} color="#cce0ff" />
                <ClapperboardModel />
            </Canvas>
        </div>
    );
}

// --- Trash Icon ---
function TrashIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    );
}

// --- Dashboard ---
export default function Dashboard() {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [analytics, setAnalytics] = useState({ totalWatched: 0, averageRating: '--', topGenre: '--' });
    const [userName, setUserName] = useState('');
    const [title, setTitle] = useState('');
    const [rating, setRating] = useState('');
    const [isWatched, setIsWatched] = useState(false);
    const [formError, setFormError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showLibraryModal, setShowLibraryModal] = useState(false);
    const [movieToDelete, setMovieToDelete] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/'); return; }
        setUserName(localStorage.getItem('userName') || 'My');
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        try {
            const [resA, resM] = await Promise.all([
                fetch(`${API_URL}/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const dataA = await resA.json();
            const dataM = await resM.json();
            if (dataA.success) setAnalytics(dataA.analytics);
            if (dataM.success) setMovies(dataM.data);
        } catch (err) { console.error('Fetch failed:', err); }
    };

    const handleAddMovie = async (e) => {
        e.preventDefault();
        setFormError('');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ title, rating: Number(rating), watched: isWatched }),
            });
            const data = await res.json();
            if (res.ok) {
                setTitle(''); setRating(''); setIsWatched(false);
                setShowAddModal(false);
                fetchData();
            } else {
                setFormError(data.message || 'Failed to add movie.');
            }
        } catch { setFormError('Server connection failed.'); }
    };

    const toggleWatchStatus = async (id, currentStatus) => {
        if (currentStatus) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ isWatched: true }),
            });
            if (res.ok) fetchData();
        } catch (err) { console.error(err); }
    };

    const confirmDelete = async () => {
        if (!movieToDelete) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/${movieToDelete}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) { setMovieToDelete(null); fetchData(); }
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        navigate('/');
    };

    return (
        <>
            <SceneBackground />

            <div className="fixed inset-0 text-white font-sans pointer-events-none overflow-hidden">

                {/* GLASSMORPHIC NAVBAR */}
                <nav className="pointer-events-auto flex items-center justify-between px-6 py-3 bg-black/30 backdrop-blur-md">
                    <h1 className="text-base font-bold tracking-tight whitespace-nowrap">
                        🎬 <span className="text-white">{userName}&apos;s</span>
                        <span className="text-neutral-400 ml-1">Watchlist</span>
                    </h1>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5">
                            <span className="text-neutral-500 text-xs uppercase tracking-wider">Watched</span>
                            <span className="text-white text-sm font-bold">{analytics.totalWatched}</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-1.5">
                            <span className="text-neutral-500 text-xs uppercase tracking-wider">Avg</span>
                            <span className="text-yellow-400 text-sm font-bold">★ {analytics.averageRating}</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-1.5">
                            <span className="text-neutral-500 text-xs uppercase tracking-wider">Top</span>
                            <span className="text-blue-400 text-sm font-bold">{analytics.topGenre}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200 transition-colors"
                        >
                            + Add Film
                        </button>
                        <button
                            onClick={() => setShowLibraryModal(true)}
                            className="px-4 py-1.5 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20 border border-white/10 transition-colors"
                        >
                            Library
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-1.5 bg-red-950/40 text-red-400 hover:bg-red-900/50 text-xs font-bold rounded-lg border border-red-900/40 transition-colors"
                        >
                            LOGOUT
                        </button>
                    </div>
                </nav>

                {/* CENTER: intentionally empty — 3D model shows through */}

                {/* ADD FILM MODAL */}
                {showAddModal && (
                    <div
                        className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
                    >
                        <div className="bg-[#0e0e0e]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold">Add Film</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-white transition-colors text-xl leading-none">×</button>
                            </div>
                            {formError && (
                                <div className="mb-4 p-3 bg-red-950/50 border border-red-900/50 text-red-400 text-xs rounded-lg">{formError}</div>
                            )}
                            <form onSubmit={handleAddMovie} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1.5 uppercase tracking-wider">Title</label>
                                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
                                        placeholder="e.g. Interstellar" />
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1.5 uppercase tracking-wider">Rating (1–5)</label>
                                    <input type="number" min="1" max="5" step="0.1" value={rating} onChange={(e) => setRating(e.target.value)}
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
                                        placeholder="e.g. 4.5" />
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                    <input type="checkbox" id="watched-modal" checked={isWatched} onChange={(e) => setIsWatched(e.target.checked)}
                                        className="w-4 h-4 bg-neutral-900 border-neutral-800 rounded accent-white" />
                                    <label htmlFor="watched-modal" className="text-sm text-neutral-300">Already Watched</label>
                                </div>
                                <button type="submit" className="w-full bg-white text-black font-bold rounded-lg px-4 py-2.5 mt-2 hover:bg-neutral-200 transition-colors text-sm">
                                    + Add to Library
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* LIBRARY MODAL */}
                {showLibraryModal && (
                    <div
                        className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowLibraryModal(false); }}
                    >
                        <div className="bg-[#0e0e0e]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[70vh] flex flex-col">
                            <div className="flex items-center justify-between mb-5 shrink-0">
                                <h2 className="text-lg font-bold">Your Library</h2>
                                <button onClick={() => setShowLibraryModal(false)} className="text-neutral-500 hover:text-white transition-colors text-xl leading-none">×</button>
                            </div>
                            {movies.length === 0 ? (
                                <p className="text-neutral-500 text-sm">No films added yet.</p>
                            ) : (
                                <div className="space-y-2 overflow-y-auto pr-1">
                                    {movies.map((movie) => (
                                        <div key={movie._id} className="group flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate">{movie.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {movie.genre?.length > 0 && <span className="text-xs text-neutral-500 uppercase tracking-wider">{movie.genre.join(', ')}</span>}
                                                    {movie.rating && <span className="text-xs text-yellow-500">★ {movie.rating}</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-3 shrink-0">
                                                <button
                                                    onClick={() => toggleWatchStatus(movie._id, movie.isWatched)}
                                                    className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
                                                        movie.isWatched
                                                            ? 'bg-green-950/60 text-green-500 border border-green-900/50'
                                                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                                                    }`}
                                                >
                                                    {movie.isWatched ? '✓ Watched' : '○ Pending'}
                                                </button>
                                                <button
                                                    onClick={() => setMovieToDelete(movie._id)}
                                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* DELETE CONFIRM MODAL */}
                {movieToDelete && (
                    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#0e0e0e]/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                            <h3 className="text-xl font-bold mb-2">Delete Film?</h3>
                            <p className="text-neutral-400 text-sm mb-6">Are you sure you want to remove this from your library? This cannot be undone.</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setMovieToDelete(null)} className="px-4 py-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors">CANCEL</button>
                                <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors">DELETE</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}
