/* AI Declaration
 * Date: October 11, 2026
 * Description: Assisted with Tailwind CSS v4 configuration, debugging Vite routing and styling the glassmorphism dashboard layout.
 * Chat Link: https://share.gemini.google/E3FLTlhfku18
 */
import { useEffect, useState } from 'react';
import api from '../api';
import { CATEGORIES, CURRENCY, decodeEntities } from '../gigUtils';

export default function GigFeed({ title = 'Browse gigs', ownerId, renderActions, refreshKey = 0 }) {
  const [gigs, setGigs] = useState([]);
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [checkoutData, setCheckoutData] = useState(null);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Fetch gigs, applying category filter directly to the API request if present
    api
      .get('/api/gigs', { params: category ? { category } : {} })
      .then((res) => {
        if (cancelled) return;
        let list = res.data.gigs || [];
        // Optional client-side filter to only show gigs for a specific freelancer
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

  const handleCategoryChange = (catName) => {
    setLoading(true);
    setCategory(catName);
  };

  const handleBookGig = async (gig) => {
    try {
      setBookingMessage('');
      const response = await api.post('/api/bookings', { gigId: gig._id });
      const createdBooking = response.data.booking;

      setCheckoutData({ booking: createdBooking, gig });
      setCardHolder('');
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setPaymentError('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Server error creating booking');
    }
  };

  const handleMockPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!checkoutData?.booking?._id) return;

    try {
      setProcessingPayment(true);
      setPaymentError('');
      const res = await api.post(`/api/bookings/${checkoutData.booking._id}/pay`, {
        cardHolder,
        cardNumber,
        expiry,
        cvv
      });

      setCheckoutData(null);
      setBookingMessage(res.data.message || 'Payment completed! Funds held in escrow until freelancer confirms.');
      setTimeout(() => setBookingMessage(''), 5000);
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Payment failed. Check your card details.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Live client-side search filtering
  const filteredGigs = gigs.filter(gig => 
    gig.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    gig.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section aria-labelledby="gig-feed-title" className="py-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 id="gig-feed-title" className="text-3xl font-black text-gray-900 tracking-tight whitespace-nowrap">
          {title}
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search gigs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#393bc6]/20 focus:border-[#393bc6] transition-all bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === '' ? 'bg-[#393bc6] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((name) => (
              <button
                key={name}
                onClick={() => handleCategoryChange(name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === name ? 'bg-[#393bc6] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {bookingMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00cc99] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          <p className="font-semibold">{bookingMessage}</p>
        </div>
      )}

      {checkoutData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-gray-900">HustleHub+ Escrow Checkout</h3>
              <button
                type="button"
                onClick={() => {
                  setCheckoutData(null);
                  setBookingMessage('Booking saved as Unpaid. You can complete payment in My Bookings.');
                  setTimeout(() => setBookingMessage(''), 4000);
                }}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
              <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Gig Summary</p>
              <p className="font-bold text-gray-900">{decodeEntities(checkoutData.gig.title)}</p>
              <p className="text-2xl font-black text-[#393bc6] mt-1">
                {CURRENCY}{checkoutData.gig.price}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Payment is held securely in escrow until the freelancer confirms your booking.
              </p>
            </div>

            {paymentError && (
              <div className="bg-red-50 text-[#ff355e] p-3 rounded-xl text-sm font-medium mb-4 border border-red-100">
                {paymentError}
              </div>
            )}

            <form onSubmit={handleMockPaymentSubmit} className="space-y-4">
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
                  onClick={() => {
                    setCheckoutData(null);
                    setBookingMessage('Booking saved as Unpaid. You can pay later in My Bookings.');
                    setTimeout(() => setBookingMessage(''), 4000);
                  }}
                  className="w-1/3 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Pay Later
                </button>
                <button
                  type="submit"
                  disabled={processingPayment}
                  className="w-2/3 py-3 bg-[#00cc99] hover:bg-[#00b386] text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
                >
                  {processingPayment ? 'Processing...' : `Pay ${CURRENCY}${checkoutData.gig.price}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#393bc6]"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-[#ff355e] p-4 rounded-xl border border-red-100 font-medium" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && filteredGigs.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg">
            {gigs.length === 0 
              ? "No gigs here yet. Freelancers can add the first one." 
              : "No gigs match your search criteria."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGigs.map((gig) => (
          <article 
            key={gig._id} 
            className="group bg-white/70 backdrop-blur-lg border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="inline-block px-3 py-1 bg-[#00cc99]/10 text-[#00cc99] text-xs font-bold rounded-full uppercase tracking-wider">
                {gig.category}
              </span>
              <span className="text-lg font-black text-gray-900">
                {CURRENCY}{gig.price}
              </span>
            </div>
            
            {/* Sanitize entities to prevent escaped HTML rendering issues */}
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {decodeEntities(gig.title)}
            </h3>
            <p className="text-gray-500 text-sm mb-6 flex-grow line-clamp-3">
              {decodeEntities(gig.description)}
            </p>

            <div className="flex items-center gap-3 mb-6 pt-4 border-t border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#393bc6] to-[#00cc99] flex items-center justify-center text-white font-bold shadow-sm">
                {(gig.owner?.name || 'F')[0].toUpperCase()}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">{decodeEntities(gig.owner?.name || 'A Freelancer')}</p>
                <p className="text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {gig.deliveryDays} {gig.deliveryDays === 1 ? 'day' : 'days'} delivery
                </p>
              </div>
            </div>

            {/* Injected action block allows parent components to override the default "Book" button */}
            {renderActions ? (
              renderActions(gig)
            ) : (
              <button 
                onClick={() => handleBookGig(gig)}
                className="w-full py-3 bg-[#393bc6] hover:bg-[#2e30a8] text-white font-semibold rounded-xl transition-colors duration-200 shadow-md group-hover:shadow-lg flex justify-center items-center gap-2"
              >
                Book this gig
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}