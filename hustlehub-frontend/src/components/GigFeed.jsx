import { useEffect, useState } from 'react';
import api from '../api';
import { CATEGORIES, CURRENCY, decodeEntities } from '../gigUtils';

// Props
export default function GigFeed({ title = 'Browse gigs', ownerId, renderActions, refreshKey = 0 }) {
  const [gigs, setGigs] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleCategoryChange = (selectedCategory) => {
    setLoading(true);
    setCategory(selectedCategory === category ? '' : selectedCategory);
  };

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

  const filteredGigs = gigs.filter(gig => 
    gig.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    gig.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="min-h-screen bg-gray-50/50 pb-12" aria-labelledby="gig-feed-title">
      
      {/* Toast Notification */}
      {bookingMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div className="bg-white border-l-4 border-caribbean-green shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-r-lg px-6 py-4 flex items-center gap-3">
            <svg className="w-6 h-6 text-caribbean-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-gray-800 font-medium">{bookingMessage}</p>
          </div>
        </div>
      )}

      {/* Hero & Search Section */}
      <div className="bg-governor-bay text-white pt-16 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <h2 id="gig-feed-title" className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {title}
          </h2>
          <p className="text-governor-bay-100 text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Discover top-tier talent and premium services tailored to your next big project.
          </p>
          
          <div className="max-w-2xl mx-auto relative">
            <input 
              type="text"
              placeholder="What service are you looking for today?"
              className="w-full pl-6 pr-14 py-4 rounded-full text-gray-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-caribbean-green/50 transition-all text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-2 top-2 bottom-2 bg-radical-red hover:bg-rose-600 text-white p-3 rounded-full transition-colors flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        
        {/* Category Pill Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-10 flex flex-wrap gap-3 justify-center items-center">
          <button 
            onClick={() => handleCategoryChange('')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${category === '' ? 'bg-caribbean-green text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All Categories
          </button>
          {CATEGORIES.map((name) => (
            <button
              key={name}
              onClick={() => handleCategoryChange(name)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${category === name ? 'bg-caribbean-green text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Status Indicators */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-governor-bay"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-radical-red/10 border border-radical-red/20 text-radical-red p-4 rounded-xl text-center font-medium">
            {error}
          </div>
        )}
        
        {!loading && !error && filteredGigs.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-gray-400 mb-3">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No gigs found. Freelancers can add the first one.</p>
          </div>
        )}

        {/* Masonry / Grid for Gig Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGigs.map((gig) => (
            <article 
              className="group bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1" 
              key={gig._id}
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-block bg-governor-bay/10 text-governor-bay text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {gig.category}
                  </span>
                  <div className="flex items-center gap-1 text-gray-500 text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {gig.deliveryDays}d
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {decodeEntities(gig.title)}
                </h3>
                
                <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">
                  {decodeEntities(gig.description)}
                </p>
                
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-caribbean-green to-governor-bay flex items-center justify-center text-white font-bold text-xs">
                    {(gig.owner?.name || 'F')[0].toUpperCase()}
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    {decodeEntities(gig.owner?.name || 'Freelancer')}
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between mt-auto">
                <p className="text-2xl font-black text-gray-900">
                  <span className="text-sm font-medium text-gray-500 mr-1">{CURRENCY}</span>
                  {gig.price}
                </p>
                
                {renderActions ? (
                  renderActions(gig)
                ) : (
                  <button 
                    className="bg-governor-bay hover:bg-indigo-800 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors shadow-sm" 
                    onClick={() => handleBookGig(gig._id)}
                  >
                    Book Now
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}