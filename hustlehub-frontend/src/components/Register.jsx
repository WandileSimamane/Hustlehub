// [FRONTEND] src/components/Register.jsx
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
        <div className="auth-container">
            <h2>Register for HustleHub+</h2>
            {error && <div className="error-banner" style={{ color: 'red' }}>{error}</div>}
            {success && <div className="success-banner" style={{ color: 'green' }}>{success}</div>}
            
            <form onSubmit={handleRegister} className="gig-form">
                <label>
                    Name
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                </label>
                <label>
                    Email Address
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </label>
                <label>
                    Password
                    <input 
                        type="password" 
                        placeholder="Password (min 8 chars)" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </label>
                <label>
                    Role
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="Client">Client</option>
                        <option value="Freelancer">Freelancer</option>
                        <option value="Admin">Admin</option>
                    </select>
                </label>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
}