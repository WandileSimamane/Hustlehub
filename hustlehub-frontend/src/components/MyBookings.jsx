import { useEffect, useState } from 'react';
import api from '../api'; 
import { CURRENCY, decodeEntities } from '../gigUtils';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    // Calls the endpoint to get the logged-in user's bookings
    api.get('/api/bookings')
      .then((res) => {
        if (!cancelled) {
          setBookings(res.data);
          setError('');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError('Failed to load your bookings. Please try again.');
          console.error(err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  if (loading) return <p>Loading your bookings...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <section className="my-bookings-page">
      <h2>My Bookings</h2>
      
      {bookings.length === 0 ? (
        <p>You haven't booked any gigs yet!</p>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card" style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px' }}>
              {/* Displaying populated Gig and Freelancer data */}
              <h3>{decodeEntities(booking.gig?.title || 'Unknown Gig')}</h3>
              <p><strong>Freelancer:</strong> {decodeEntities(booking.freelancer?.name || 'Unknown')}</p>
              <p><strong>Status:</strong> <span style={{ fontWeight: 'bold' }}>{booking.status}</span></p>
              <p><strong>Price:</strong> {CURRENCY}{booking.gig?.price}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}