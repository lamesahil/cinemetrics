import { useNavigate } from 'react-router-dom';
import { useState } from 'react';


const API_URL = 'https://cnemetrics.onrender.com/api/users';

export default function Auth() {
    const navigate = useNavigate();
    // Vanilla JS ka let isLogin = true; ab React State ban gaya hai
    const [isLogin, setIsLogin] = useState(true);
    
    // Inputs track karne ke liye states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const endpoint = isLogin ? '/login' : '/register';
        const payload = { email, password };
        if (!isLogin) payload.name = name;

        try {
            const response = await fetch(API_URL + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.name);
                navigate('/dashboard'); // Yeh line zaroori hai!
            } else {
                alert('❌ Auth Failed: ' + data.message);
            }
        } catch (error) {
            console.error("Auth error:", error);
            alert('Server is down or unreachable!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-2xl p-8 shadow-2xl">
                
                <h2 className="text-3xl font-bold mb-6 text-center tracking-tight">
                    {isLogin ? 'Welcome Back' : 'Join CineMetrics'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1">Name</label>
                            <input 
                                type="text" 
                                required 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white transition-colors"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Password</label>
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white transition-colors"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-white text-black font-bold rounded-lg px-4 py-3 mt-4 hover:bg-neutral-200 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-neutral-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        onClick={() => setIsLogin(!isLogin)} 
                        className="text-white hover:underline font-medium"
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
}