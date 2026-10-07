import { useState } from 'react';
import api from '../api';
import { decodeEntities } from '../gigUtils';
import GigForm from './GigForm';
import GigFeed from './GigFeed';
import './gigs.css';

// Freelancer: pass ownerId to manage only their own gigs.
// Admin: omit ownerId to manage every gig.
export default function GigManager({ ownerId }) {
  const [editing, setEditing] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState('');

  const refresh = () => {
    setEditing(null);
    setRefreshKey((k) => k + 1);
  };

  const remove = async (gig) => {
    if (!window.confirm(`Delete "${decodeEntities(gig.title)}"?`)) return;
    setError('');
    try {
      await api.delete(`/api/gigs/${gig._id}`);
      refresh();
    } catch (err) {
      const { status, data } = err.response || {};
      setError(
        status === 403
          ? 'You are not allowed to delete this gig.'
          : data?.message || 'Could not delete the gig.'
      );
    }
  };

  return (
    <>
      <GigForm
        key={editing?._id || 'new'}
        gig={editing}
        onCreated={refresh}
        onCancel={() => setEditing(null)}
      />

      {error && (
        <p className="gig-error gig-section" role="alert">
          {error}
        </p>
      )}

      <GigFeed
        title={ownerId ? 'My gigs' : 'All gigs'}
        ownerId={ownerId}
        refreshKey={refreshKey}
        renderActions={(gig) => (
          <div className="gig-actions">
            <button
              type="button"
              onClick={() => {
                setEditing(gig);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Edit
            </button>
            <button type="button" className="btn-danger" onClick={() => remove(gig)}>
              Delete
            </button>
          </div>
        )}
      />
    </>
  );
}