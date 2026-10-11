import { useEffect, useState } from 'react';
import api from '../api';
import { CURRENCY, decodeEntities } from '../gigUtils';

export default function FreelancerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/bookings');
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
    <section aria-labelledby="bookings-title" className="py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 id="bookings-title" className="text-3xl font-black text-gray-900 tracking-tight">Manage Bookings</h2>
        <div className="bg-[#00cc99]/10 px-4 py-2 rounded-xl border border-[#00cc99]/20">
          <p className="text-sm font-medium text-[#00cc99] uppercase tracking-wider">Confirmed Income</p>
          <p className="text-2xl font-black text-gray-900">{CURRENCY}{income.toFixed(2)}</p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#393bc6]"></div>
        </div>
      )}
      
      {error && <p className="bg-red-50 text-[#ff355e] p-4 rounded-xl border border-red-100 font-medium mb-6">{error}</p>}
      
      {!loading && !error && bookings.length === 0 && (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-500">No bookings yet.</p>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {bookings.map((b) => (
            <div key={b._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                  b.status === 'Confirmed' ? 'bg-[#00cc99]/10 text-[#00cc99]' : 
                  b.status === 'Declined' ? 'bg-[#ff355e]/10 text-[#ff355e]' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {b.status || 'Pending'}
                </span>
                <span className="font-black text-lg text-[#393bc6]">
                  {CURRENCY}{b.amount ?? b.gig?.price}
                </span>
              </div>
              
              <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{decodeEntities(b.gig?.title || 'Gig')}</h3>
              <p className="text-sm text-gray-500 mb-6 flex-grow">
                Booked by <span className="font-semibold text-gray-700">{decodeEntities(b.client?.name || 'a client')}</span>
              </p>

              {(!b.status || b.status === 'Pending') && (
                <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(b._id, 'Confirmed')}
                    className="py-2.5 bg-[#00cc99] hover:bg-[#00b386] text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(b._id, 'Declined')}
                    className="py-2.5 bg-white border-2 border-[#ff355e] text-[#ff355e] hover:bg-[#ff355e] hover:text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}