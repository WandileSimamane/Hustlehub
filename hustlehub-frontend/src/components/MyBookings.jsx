import { useEffect, useState } from 'react';
import api from '../api'; 
import { CURRENCY, decodeEntities } from '../gigUtils';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/api/bookings')
      .then((res) => {
        setBookings(res.data);
        setError('');
      })
      .catch((err) => {
        setError('Failed to load your bookings. Please try again.');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      setProcessingPayment(true);
      setPaymentError('');
      await api.post(`/api/bookings/${selectedBooking._id}/pay`, {
        cardHolder,
        cardNumber,
        expiry,
        cvv
      });
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Payment failed. Please verify your card details.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#393bc6]"></div>
    </div>
  );
  
  if (error) return <p className="bg-red-50 text-[#ff355e] p-4 rounded-xl border border-red-100 font-medium">{error}</p>;

  return (
    <section className="py-8">
      <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">My Bookings</h2>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-gray-900">Complete Booking Payment</h3>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
              <p className="font-bold text-gray-900">{decodeEntities(selectedBooking.gig?.title || 'Gig')}</p>
              <p className="text-2xl font-black text-[#393bc6] mt-1">
                {CURRENCY}{selectedBooking.gig?.price}
              </p>
            </div>

            {paymentError && (
              <div className="bg-red-50 text-[#ff355e] p-3 rounded-xl text-sm font-medium mb-4 border border-red-100">
                {paymentError}
              </div>
            )}

            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="W. Simamane"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#393bc6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Card Number (16 Digits)</label>
                <input
                  type="text"
                  required
                  maxLength="19"
                  placeholder="4532 0151 1283 0366"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#393bc6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength="5"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#393bc6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">CVV</label>
                  <input
                    type="password"
                    required
                    maxLength="4"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#393bc6]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="w-1/3 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingPayment}
                  className="w-2/3 py-3 bg-[#00cc99] hover:bg-[#00b386] text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {processingPayment ? 'Processing...' : `Pay ${CURRENCY}${selectedBooking.gig?.price}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg">You haven't booked any gigs yet!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-1">
                {decodeEntities(booking.gig?.title || 'Unknown Gig')}
              </h3>
              
              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <span className="text-gray-500">Freelancer</span>
                  <span className="font-semibold text-gray-900">{decodeEntities(booking.freelancer?.name || 'Unknown')}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <span className="text-gray-500">Booking Status</span>
                  <span className={`font-bold px-2 py-1 rounded-md ${
                    booking.status === 'Confirmed' ? 'bg-green-50 text-[#00cc99]' : 
                    booking.status === 'Declined' ? 'bg-red-50 text-[#ff355e]' : 
                    'bg-yellow-50 text-yellow-600'
                  }`}>
                    {booking.status || 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <span className="text-gray-500">Payment</span>
                  <span className={`font-bold px-2 py-1 rounded-md ${
                    booking.paymentStatus === 'Paid' ? 'bg-blue-50 text-[#393bc6]' : 
                    booking.paymentStatus === 'Refunded' ? 'bg-gray-100 text-gray-600' : 
                    'bg-orange-50 text-orange-600'
                  }`}>
                    {booking.paymentStatus === 'Paid' && booking.status === 'Pending'
                      ? 'Paid (In Escrow)'
                      : (booking.paymentStatus || 'Unpaid')}
                  </span>
                </div>
                {booking.paymentReference && (
                  <div className="flex justify-between items-center pb-2 text-xs text-gray-400">
                    <span>Ref</span>
                    <span className="font-mono">{booking.paymentReference}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                <span className="text-gray-500 font-medium">Total Price</span>
                <span className="text-2xl font-black text-[#393bc6]">
                  {CURRENCY}{booking.gig?.price}
                </span>
              </div>

              {(!booking.paymentStatus || booking.paymentStatus === 'Unpaid') && booking.status !== 'Declined' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setCardHolder('');
                    setCardNumber('');
                    setExpiry('');
                    setCvv('');
                    setPaymentError('');
                  }}
                  className="mt-4 w-full py-2.5 bg-[#00cc99] hover:bg-[#00b386] text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                >
                  Pay Now ({CURRENCY}{booking.gig?.price})
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}