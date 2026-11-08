/* AI Declaration
 * Date: October 11, 2026
 * Description: Assisted with Tailwind CSS v4 configuration, debugging Vite routing and styling the glassmorphism dashboard layout.
 * Chat Link: https://share.gemini.google/E3FLTlhfku18
 */
import { useState } from 'react';
import api from '../api';
import { decodeEntities } from '../gigUtils';
import GigForm from './GigForm';
import GigFeed from './GigFeed';

// Wrapper component to handle full CRUD workflow
// If ownerId is provided (Freelancer), limits management to their own gigs.
// If omitted (Admin), grants global management rights.
export default function GigManager({ ownerId }) {
  const [editing, setEditing] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState('');

  // Increment key to trigger a refetch in the child GigFeed component
  const refresh = () => {
    setEditing(null);
    setRefreshKey((k) => k + 1);
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

      {/* Re-use GigFeed but inject management controls instead of standard booking button */}
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
              className={`py-2.5 border-2 text-sm font-bold rounded-xl transition-colors ${
                gig.status === 'unpublished' 
                  ? 'bg-[#00cc99]/10 border-[#00cc99] text-[#00cc99] hover:bg-[#00cc99] hover:text-white'
                  : 'bg-white border-[#ff355e] text-[#ff355e] hover:bg-[#ff355e] hover:text-white'
              }`} 
              onClick={async () => {
                if (!window.confirm(`${gig.status === 'unpublished' ? 'Publish' : 'Unpublish'} "${decodeEntities(gig.title)}"?`)) return;
                try {
                  await api.delete(`/api/gigs/${gig._id}`);
                  refresh();
                } catch (err) {
                  setError(err.response?.data?.message || 'Could not update gig status.');
                }
              }}
            >
              {gig.status === 'unpublished' ? 'Publish' : 'Unpublish'}
            </button>
          </div>
        )}
      />
    </>
  );
}