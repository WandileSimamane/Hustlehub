import { useState, useEffect } from 'react';
import api from '../api';
import { CURRENCY, decodeEntities } from '../gigUtils';
import GigFeed from './GigFeed';
import GigManager from './GigManager';
import FreelancerBookings from './FreelancerBookings';
import './gigs.css';

function ClientView() {
  const [bookedGigIds, setBookedGigIds] = useState(new Set());
  const [bookingStatuses, setBookingStatuses] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClientBookings = async () => {
      try {
        const res = await api.get('/api/bookings');
        const list = Array.isArray(res.data) ? res.data : (res.data.bookings || []);
        
        const ids = new Set();
        const statuses = {};
        
        list.forEach((b) => {
          const gigId = b.gig?._id || b.gig;
          if (gigId) {
            ids.add(gigId);
            statuses[gigId] = b.status || 'Pending';
          }
        });

        setBookedGigIds(ids);
        setBookingStatuses(statuses);
      } catch (err) {
        console.error('Failed to fetch client bookings', err);
      }
    };

    fetchClientBookings();
  }, []);

  const book = async (gig) => {
    setError('');
    try {
      await api.post('/api/bookings', { gigId: gig._id });
      setBookedGigIds((prev) => new Set(prev).add(gig._id));
      setBookingStatuses((prev) => ({ ...prev, [gig._id]: 'Pending' }));
    } catch (err) {
      const { status, data } = err.response || {};
      if (!status) setError('Cannot reach the server. Try again.');
      else setError(data?.message || 'Could not complete the booking. Please try again.');
    }
  };

  return (
    <>
      {error && (
        <p className="gig-error" role="alert">
          {error}
        </p>
      )}
      <GigFeed
        title="Pick a gig"
        renderActions={(gig) => {
          const isBooked = bookedGigIds.has(gig._id);
          const currentStatus = bookingStatuses[gig._id] || 'Pending';

          if (isBooked) {
            return (
              <div className="gig-actions">
                <button 
                  type="button" 
                  disabled 
                  style={{ 
                    backgroundColor: currentStatus === 'Confirmed' ? '#28a745' : '#6c757d', 
                    color: '#fff', 
                    cursor: 'not-allowed',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px'
                  }}
                >
                  {currentStatus === 'Confirmed' ? 'Confirmed' : 'Pending'}
                </button>
              </div>
            );
          }

          return (
            <div className="gig-actions">
              <button type="button" onClick={() => book(gig)}>
                Book this gig
              </button>
            </div>
          );
        }}
      />
    </>
  );
}

// Component for Admin oversight to view all bookings and their statuses
function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/bookings')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data.bookings || []);
        setBookings(list);
      })
      .catch(() => {
        setError('Could not load all system bookings.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="gig-section" aria-labelledby="admin-bookings-title">
      <h2 id="admin-bookings-title">All Bookings & Pending Gigs (Admin Oversight)</h2>

      {loading && <p>Loading all bookings...</p>}
      {error && <p className="gig-error" role="alert">{error}</p>}
      {!loading && !error && bookings.length === 0 && <p>No bookings in the system yet.</p>}

      {bookings.length > 0 && (
        <ul className="booking-list">
          {bookings.map((b) => (
            <li key={b._id} className="booking-item" style={{ marginBottom: '15px', padding: '10px', border: '1px solid #444', borderRadius: '6px' }}>
              <div>
                <strong>{decodeEntities(b.gig?.title || 'Gig')}</strong> — Booked by{' '}
                {decodeEntities(b.client?.name || 'Client')} (Freelancer: {decodeEntities(b.freelancer?.name || 'Freelancer')}) for {CURRENCY}
                {b.amount ?? b.gig?.price}
                <span style={{ marginLeft: '10px', fontWeight: 'bold', color: b.status === 'Confirmed' ? '#28a745' : b.status === 'Declined' ? '#dc3545' : '#ffc107' }}>
                  [{b.status || 'Pending'}]
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return null;
  const userId = user.id || user._id;

  return (
    <div>
      <header className="gig-section dash-header">
        <h1>Welcome, {user.name || user.role}</h1>
        <p className="dash-role">Signed in as {user.role}</p>
      </header>

      {user.role === 'Client' && <ClientView />}

      {user.role === 'Freelancer' && (
        <>
          <GigManager ownerId={userId} />
          <FreelancerBookings />
        </>
      )}

      {user.role === 'Admin' && (
        <>
          <GigManager />
          <AdminBookings />
        </>
      )}
    </div>
  );
}