import { useEffect, useState } from 'react';
import api from '../api';
import { CATEGORIES, CURRENCY, decodeEntities } from '../gigUtils';
import './gigs.css';

// Props (all optional, so existing tests still pass):
//   title          heading text
//   ownerId        only show gigs owned by this user (freelancer "My gigs")
//   renderActions  (gig) => buttons shown under each card (Book, Edit, Delete...)
//   refreshKey     change this number to reload the list
export default function GigFeed({ title = 'Browse gigs', ownerId, renderActions, refreshKey = 0 }) {
  const [gigs, setGigs] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    api
      .get('/api/gigs', { params: category ? { category } : {} })
      .then((res) => {
        if (cancelled) return;
        let list = res.data.gigs || [];
        if (ownerId) list = list.filter((g) => (g.owner?._id || g.owner) === ownerId);
        setGigs(list);
        setError('');
      })
      .catch(() => {
        if (cancelled) return;
        setGigs([]);
        setError('Could not load gigs. Check that the server is running and try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, ownerId, refreshKey]);

  const handleCategoryChange = (event) => {
    setLoading(true);
    setCategory(event.target.value);
  };

  // Built-in book handler if no custom action overrides it
  const handleBookGig = async (gigId) => {
    try {
      setBookingMessage('');
      const response = await api.post('/api/bookings', { gigId });
      setBookingMessage(response.data.message || 'Gig successfully booked! Status is pending.');
      setTimeout(() => setBookingMessage(''), 4000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Server error creating booking');
    }
  };

  return (
    <section className="gig-section" aria-labelledby="gig-feed-title">
      <h2 id="gig-feed-title">{title}</h2>

      {bookingMessage && (
        <p className="booking-success-banner" style={{ color: 'green', fontWeight: 'bold' }}>
          {bookingMessage}
        </p>
      )}

      <div className="gig-toolbar">
        <label htmlFor="gig-category-filter">Category</label>
        <select id="gig-category-filter" value={category} onChange={handleCategoryChange}>
          <option value="">All categories</option>
          {CATEGORIES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading gigs...</p>}
      {error && (
        <p className="gig-error" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && gigs.length === 0 && (
        <p>No gigs here yet. Freelancers can add the first one.</p>
      )}

      <div className="gig-grid">
        {gigs.map((gig) => (
          <article className="gig-card" key={gig._id}>
            <h3>{decodeEntities(gig.title)}</h3>
            <p className="gig-category">{gig.category}</p>
            <p className="gig-owner">Offered by {decodeEntities(gig.owner?.name || 'a freelancer')}</p>
            <p>{decodeEntities(gig.description)}</p>
            <p className="gig-price">
              {CURRENCY}
              {gig.price} for delivery in {gig.deliveryDays} {gig.deliveryDays === 1 ? 'day' : 'days'}
            </p>
            
            {/* Renders custom actions if provided, otherwise shows default booking button */}
            {renderActions ? (
              renderActions(gig)
            ) : (
              <button 
                className="book-gig-btn" 
                onClick={() => handleBookGig(gig._id)}
              >
                Book this gig
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}