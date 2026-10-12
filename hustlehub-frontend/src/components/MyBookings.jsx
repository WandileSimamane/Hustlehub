import { useEffect, useState } from 'react';
import api from '../api'; 
import { CURRENCY, decodeEntities } from '../gigUtils';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    
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

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#393bc6]"></div>
    </div>
  );
  
  if (error) return <p className="bg-red-50 text-[#ff355e] p-4 rounded-xl border border-red-100 font-medium">{error}</p>;

  return (
    <section className="py-8">
      <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">My Bookings</h2>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg">You haven't booked any gigs yet!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-1">
                {decodeEntities(booking.gig?.title || 'Unknown Gig')}
              </h3>
              
              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <span className="text-gray-500">Freelancer</span>
                  <span className="font-semibold text-gray-900">{decodeEntities(booking.freelancer?.name || 'Unknown')}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-bold px-2 py-1 rounded-md ${
                    booking.status === 'Confirmed' ? 'bg-green-50 text-[#00cc99]' : 
                    booking.status === 'Declined' ? 'bg-red-50 text-[#ff355e]' : 
                    'bg-yellow-50 text-yellow-600'
                  }`}>
                    {booking.status || 'Pending'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <span className="text-gray-500 font-medium">Total Price</span>
                <span className="text-2xl font-black text-[#393bc6]">
                  {CURRENCY}{booking.gig?.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}