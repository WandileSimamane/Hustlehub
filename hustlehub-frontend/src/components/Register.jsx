import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Client');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await api.post('/api/auth/register', {
                name,
                email,
                password,
                role
            });
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            const errData = err.response?.data;
            if (errData?.errors) {
                setError(errData.errors.map(e => e.msg).join(', '));
            } else {
                setError(errData?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-[#393bc6]">Join HustleHub+</h2>
                    <p className="text-gray-500 mt-2">Create your account to get started.</p>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-[#ff355e] text-sm font-medium rounded-xl border border-red-100">{error}</div>}
                {success && <div className="mb-6 p-4 bg-green-50 text-[#00cc99] text-sm font-medium rounded-xl border border-green-100">{success}</div>}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Jane Doe" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#393bc6] focus:ring-2 focus:ring-[#393bc6]/20 transition-all outline-none"
                        />
                    </div>
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
                            placeholder="Min. 8 characters" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#393bc6] focus:ring-2 focus:ring-[#393bc6]/20 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">I want to join as a</label>
                        <select 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#393bc6] focus:ring-2 focus:ring-[#393bc6]/20 transition-all outline-none bg-white"
                        >
                            <option value="Client">Client (Hire talent)</option>
                            <option value="Freelancer">Freelancer (Find work)</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-4 mt-4 bg-gradient-to-r from-[#393bc6] to-[#2e30a8] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creating account...' : 'Register Now'}
                    </button>
                </form>
            </div>
        </div>
    );
}