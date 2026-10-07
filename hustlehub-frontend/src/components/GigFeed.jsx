import { useEffect, useState } from 'react';
import api from '../api';
import { CATEGORIES, CURRENCY, decodeEntities } from '../gigUtils';
import './gigs.css';

export default function GigFeed() {
  const [gigs, setGigs] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    api
      .get('/api/gigs', { params: category ? { category } : {} })
      .then((res) => {
        if (cancelled) return;
        setGigs(res.data.gigs || []);
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
  }, [category]);

  const handleCategoryChange = (event) => {
    setLoading(true);
    setCategory(event.target.value);
  };

  return (
    <section className="gig-section" aria-labelledby="gig-feed-title">
      <h2 id="gig-feed-title">Browse gigs</h2>

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
          </article>
        ))}
      </div>
    </section>
  );
}
