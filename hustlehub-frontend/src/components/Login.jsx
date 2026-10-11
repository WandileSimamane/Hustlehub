import { useState } from 'react';
import api from '../api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

   const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/api/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Route based on role
                if (response.data.user.role === 'Client') {
                    window.location.assign('/gigs');
                } else {
                    window.location.assign('/dashboard');
                }
            } else {
                window.location.assign('/');
            }
        } catch (err) {
            if (err.response && err.response.data.errors) {
                setError(err.response.data.errors[0].msg);
            } else if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('A network error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-[#393bc6]">Login to HustleHub+</h2>
                    <p className="text-gray-500 mt-2">Welcome back! Please enter your details.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-[#ff355e] text-sm font-medium rounded-xl border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#393bc6] focus:ring-2 focus:ring-[#393bc6]/20 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#393bc6] focus:ring-2 focus:ring-[#393bc6]/20 transition-all outline-none"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-4 mt-4 bg-gradient-to-r from-[#393bc6] to-[#2e30a8] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}