import { useState } from 'react';
import api from '../api';
import { decodeEntities } from '../gigUtils';
import GigForm from './GigForm';
import GigFeed from './GigFeed';

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
        <div className="bg-red-50 text-[#ff355e] p-4 rounded-xl border border-red-100 font-medium mb-8" role="alert">
          {error}
        </div>
      )}

      <GigFeed
        title={ownerId ? 'My gigs' : 'All gigs'}
        ownerId={ownerId}
        refreshKey={refreshKey}
        renderActions={(gig) => (
          <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={() => {
                setEditing(gig);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors"
            >
              Edit
            </button>
            <button 
              type="button" 
              className="py-2.5 bg-white border-2 border-[#ff355e] text-[#ff355e] hover:bg-[#ff355e] hover:text-white text-sm font-bold rounded-xl transition-colors" 
              onClick={() => remove(gig)}
            >
              Delete
            </button>
          </div>
        )}
      />
    </>
  );
}