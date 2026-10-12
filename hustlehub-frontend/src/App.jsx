/* AI Declaration
 * Date: October 11, 2026
 * Description: Assisted with Tailwind CSS v4 configuration, debugging Vite routing and styling the glassmorphism dashboard layout.
 * Chat Link: https://share.gemini.google/E3FLTlhfku18
 */
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import IncomeDashboard from './components/IncomeDashboard';
import MyBookings from './components/MyBookings';
import GigFeed from './components/GigFeed';
import GigManager from './components/GigManager'; 
import FreelancerBookings from './components/FreelancerBookings';

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

// Higher Order Component to enforce authenticated access
function RequireLogin({ children }) {
  if (!getUser() || !localStorage.getItem('token')) return <Navigate to="/login" replace />;
  return children;
}

function Nav() {
  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.assign('/');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'border-[#393bc6] text-[#393bc6]'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`;

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm" aria-label="Main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <NavLink to="/" className="flex items-center text-2xl font-black text-[#393bc6] tracking-tight" end>
              HustleHub<span className="text-[#ff355e]">+</span>
            </NavLink>
            
            {/* Render navigation links based on explicit RBAC user roles */}
            {user && (
              <div className="hidden sm:flex sm:space-x-8">
                {user.role === 'Client' && (
                  <>
                    <NavLink to="/gigs" className={navLinkClass}>Browse Gigs</NavLink>
                    <NavLink to="/my-bookings" className={navLinkClass}>My Bookings</NavLink>
                  </>
                )}
                
                {user.role === 'Freelancer' && (
                  <>
                    <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                    <NavLink to="/income" className={navLinkClass}>Income</NavLink>
                    <NavLink to="/manage-gigs" className={navLinkClass}>Manage Gigs</NavLink>
                    <NavLink to="/manage-bookings" className={navLinkClass}>Manage Bookings</NavLink>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-[#ff355e] hover:bg-[#e02e52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff355e] transition-colors shadow-md"
              >
                Log out ({user.name || user.role})
              </button>
            ) : (
              <>
                <NavLink to="/login" className="text-sm font-medium text-gray-500 hover:text-[#393bc6] transition-colors">
                  Log in
                </NavLink>
                <NavLink
                  to="/register"
                  className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-[#393bc6] hover:bg-[#2e30a8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#393bc6] transition-colors shadow-md"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const user = getUser();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Nav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Client Routes */}
            <Route path="/gigs" element={<RequireLogin><GigFeed /></RequireLogin>} />
            <Route path="/my-bookings" element={<RequireLogin><MyBookings /></RequireLogin>} />
        
           {/* Freelancer Routes */}
            <Route path="/dashboard" element={<RequireLogin><Dashboard /></RequireLogin>} />
            <Route path="/income" element={<RequireLogin><IncomeDashboard /></RequireLogin>} />
            <Route 
              path="/manage-bookings" 
              element={<RequireLogin><FreelancerBookings /></RequireLogin>} 
            />
            
            {/* Freelancer Gig Management Route */}
            <Route 
              path="/manage-gigs" 
              element={
                <RequireLogin>
                  {/* Passes the logged-in user's ID so they only manage their own gigs */}
                  <GigManager ownerId={user?._id || user?.id} /> 
                </RequireLogin>
              } 
            />
            
            {/* Fallback boundary */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;