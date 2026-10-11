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
            await api.post('/api/auth/register', { name, email, password, role });
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

    const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-governor-bay/50 transition-colors";

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-governor-bay mb-2">Join HustleHub+</h2>
                    <p className="text-gray-500">Create an account to start collaborating.</p>
                </div>
                
                {error && <div className="mb-6 p-4 bg-radical-red/10 border border-radical-red/20 text-radical-red rounded-xl text-sm font-medium">{error}</div>}
                {success && <div className="mb-6 p-4 bg-caribbean-green/10 border border-caribbean-green/20 text-caribbean-green rounded-xl text-sm font-medium">{success}</div>}
                
                <form onSubmit={handleRegister} className="flex flex-col gap-5">
                    <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
                        Full Name
                        <input 
                            type="text" 
                            placeholder="John Doe" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            className={inputClass}
                        />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
                        Email Address
                        <input 
                            type="email" 
                            placeholder="john@example.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className={inputClass}
                        />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
                        Password
                        <input 
                            type="password" 
                            placeholder="Min. 8 characters" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className={inputClass}
                        />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
                        Account Role
                        <select 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                            className={inputClass}
                        >
                            <option value="Client">I want to hire (Client)</option>
                            <option value="Freelancer">I want to work (Freelancer)</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </label>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="mt-4 w-full bg-governor-bay hover:bg-indigo-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-governor-bay/30 transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                        {isLoading ? 'Registering...' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}