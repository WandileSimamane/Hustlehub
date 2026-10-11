import { Link, Navigate } from 'react-router-dom';
import './gigs.css';

export default function Home() {
  // Already logged in? Skip the landing page.
  if (localStorage.getItem('token')) return <Navigate to="/dashboard" replace />;

  return (
    <section className="home-hero">
      <h1>Find a freelancer. Or become one.</h1>
      <p className="home-lead">
        HustleHub+ connects clients with freelancers for design, tutoring, writing and more.
      </p>

      <div className="home-actions">
        <Link className="btn btn-primary" to="/login">
          Log in
        </Link>
        <Link className="btn btn-secondary" to="/register">
          Create an account
        </Link>
      </div>

      
    </section>
  );
}