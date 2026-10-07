import { useEffect, useState } from 'react';
import api from '../api';
import { CURRENCY, decodeEntities } from '../gigUtils';
import './gigs.css';

export default function FreelancerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/bookings');
      // Handle both array response or { bookings: [...] } response format safely
      const list = Array.isArray(res.data) ? res.data : (res.data.bookings || []);
      setBookings(list);
      setError('');
    } catch (err) {
      setError('Could not load your bookings. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await api.patch(`/api/bookings/${bookingId}/status`, { status: newStatus });
      // Refresh bookings list after updating status
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  const income = bookings.reduce((sum, b) => {
    if (b.status === 'Confirmed') {
      return sum + Number(b.amount ?? b.gig?.price ?? 0);
    }
    return sum;
  }, 0);

  return (
    <section className="gig-section" aria-labelledby="bookings-title">
      <h2 id="bookings-title">My bookings</h2>

      {loading && <p>Loading bookings...</p>}
      {error && (
        <p className="gig-error" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && bookings.length === 0 && <p>No bookings yet.</p>}

      {bookings.length > 0 && (
        <>
          <p className="gig-price">
            Total confirmed income: {CURRENCY}
            {income.toFixed(2)}
          </p>
          <ul className="booking-list">
            {bookings.map((b) => (
              <li key={b._id} className="booking-item" style={{ marginBottom: '15px', padding: '10px', border: '1px solid #444', borderRadius: '6px' }}>
                <div>
                  <strong>{decodeEntities(b.gig?.title || 'Gig')}</strong> booked by{' '}
                  {decodeEntities(b.client?.name || 'a client')} for {CURRENCY}
                  {b.amount ?? b.gig?.price}
                  <span style={{ marginLeft: '10px', fontWeight: 'bold', color: b.status === 'Confirmed' ? '#28a745' : b.status === 'Declined' ? '#dc3545' : '#ffc107' }}>
                    ({b.status || 'Pending'})
                  </span>
                </div>

                {/* Show Confirm and Decline buttons if the booking is Pending */}
                {(!b.status || b.status === 'Pending') && (
                  <div className="gig-actions" style={{ marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(b._id, 'Confirmed')}
                      style={{ marginRight: '8px', backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(b._id, 'Declined')}
                      style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Decline
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}