import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import MyBookings from './components/MyBookings';
import './App.css';

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

// Sends visitors who are not logged in back to the login page.
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

  return (
    <nav className="app-nav" aria-label="Main">
      <NavLink to="/" className="app-brand" end>
        HustleHub+
      </NavLink>
      {user ? (
        <>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <button type="button" onClick={handleLogout}>
            Log out ({user.name || user.role})
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login">Log in</NavLink>
          <NavLink to="/register">Register</NavLink>
        </>
      )}
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route
            path="/dashboard"
            element={
              <RequireLogin>
                <Dashboard />
              </RequireLogin>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
