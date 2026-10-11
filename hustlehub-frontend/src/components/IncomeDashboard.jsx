import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'https://localhost:5000';
const rand = (n) => `R${Number(n || 0).toFixed(2)}`;

export default function IncomeDashboard() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const get = async (path) => {
      const res = await fetch(`${API}/api/dashboard/${path}`, { headers });
      if (!res.ok) throw new Error(res.status === 403 ? 'forbidden' : 'failed');
      return (await res.json()).data;
    };

    Promise.all([get('summary'), get('transactions'), get('bookings')])
      .then(([s, t, b]) => {
        setSummary(s);
        setTransactions(t);
        setBookings(b);
      })
      .catch((e) =>
        setError(
          e.message === 'forbidden'
            ? 'Only freelancers can view the dashboard.'
            : 'Could not load your dashboard. Please try again later.'
        )
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#393bc6]"></div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-red-50 border border-red-100 text-[#ff355e] rounded-xl font-medium text-center">
      {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Freelancer Dashboard</h1>
            <p className="text-gray-500 mt-1">Overview of your earnings and recent activity</p>
          </div>
          <button className="mt-4 md:mt-0 bg-[#00cc99] hover:bg-[#00b386] text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Create New Gig
          </button>
        </div>

        {/* Top Summary Cards */}
        <section aria-label="Total earnings" className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Primary Stat Card (Glassmorphism inspired) */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <h2 className="text-gray-900 font-bold text-lg mb-1">Total Earnings</h2>
                  <p className="text-gray-500 text-sm mb-6">Your sales monitoring dashboard.</p>
                  
                  <div className="flex items-baseline gap-3">
                    <p data-testid="total-earnings" className="text-5xl font-black text-[#393bc6] tracking-tight">
                      {rand(summary.totalIncome)}
                    </p>
                    <span className="text-[#00cc99] font-semibold text-sm bg-[#00cc99]/10 px-2.5 py-1 rounded-md">
                      +12.5% 
                    </span>
                  </div>
                  <small className="block mt-2 text-gray-500 font-medium">{summary.transactionCount} successful transaction(s)</small>
                </div>
                
                {/* Decorative Icon */}
                <div className="bg-[#393bc6]/10 p-4 rounded-xl text-[#393bc6]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
            </div>

            {/* Promotional / Call to Action Card */}
            <div className="bg-gradient-to-br from-[#393bc6] to-[#2e30a8] rounded-2xl shadow-lg p-8 text-white relative overflow-hidden flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-2 z-10">Get premium account!</h3>
              <p className="text-indigo-200 text-sm mb-6 max-w-[200px] z-10">Optimize your selling product and enjoy the advantage of premium.</p>
              <button className="bg-white text-[#393bc6] hover:bg-gray-50 font-bold py-2.5 px-6 rounded-lg self-start transition-colors shadow-sm z-10">
                Get Premium
              </button>
              {/* Decorative Circles */}
              <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-[#ff355e] rounded-full opacity-90"></div>
              <div className="absolute top-10 -right-10 w-24 h-24 bg-[#00cc99] rounded-full opacity-90 blur-xl"></div>
            </div>
          </div>
        </section>

        {/* Tables Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Bookings Table */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Bookings Received</h2>
                <p className="text-sm text-gray-500 mt-1">Recent client requests</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              {bookings.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No bookings yet.</div>
              ) : (
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-4 pl-6">Gig</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                        <td className="p-4 pl-6 text-gray-900 font-medium">{b.gig?.title}</td>
                        <td className="p-4 text-gray-600 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#393bc6]/10 text-[#393bc6] flex items-center justify-center font-bold text-xs">
                            {(b.client?.name || 'C')[0].toUpperCase()}
                          </div>
                          {b.client?.name}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            b.status === 'Confirmed' ? 'bg-[#00cc99]/10 text-[#00cc99]' :
                            b.status === 'Declined' ? 'bg-[#ff355e]/10 text-[#ff355e]' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {b.status || 'Pending'}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-gray-500 text-sm">{new Date(b.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Transactions</h2>
                <p className="text-sm text-gray-500 mt-1">Payment history</p>
              </div>
              <button className="text-[#393bc6] hover:text-[#2e30a8] p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              {transactions.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No transactions yet.</div>
              ) : (
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-4 pl-6">Date</th>
                      <th className="p-4">Client</th>
                      <th className="p-4 pr-6 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((t) => (
                      <tr key={t._id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <td className="p-4 pl-6 text-gray-500 text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-gray-600 font-medium">{t.client?.name}</td>
                        <td className="p-4 pr-6 text-gray-900 font-bold text-right">{rand(t.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}