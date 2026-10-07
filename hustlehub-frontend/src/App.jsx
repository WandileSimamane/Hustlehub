import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import GigFeed from './components/GigFeed';
import GigForm from './components/GigForm';
import './App.css';

function Nav() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.assign('/login');
  };

  return (
    <nav className="app-nav" aria-label="Main">
      <NavLink to="/gigs">Browse gigs</NavLink>
      {user?.role === 'Freelancer' && <NavLink to="/gigs/new">Create a gig</NavLink>}
      {!user && <NavLink to="/register">Register</NavLink>}
      {!user && <NavLink to="/login">Log in</NavLink>}
      {user && (
        <button type="button" onClick={handleLogout}>
          Log out ({user.role})
        </button>
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
          <Route path="/" element={<Navigate to="/gigs" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/gigs" element={<GigFeed />} />
          <Route path="/gigs/new" element={<GigForm />} />
          <Route path="*" element={<Navigate to="/gigs" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
