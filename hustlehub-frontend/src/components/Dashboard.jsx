import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'https://localhost:5000';
const rand = (n) => `R${Number(n || 0).toFixed(2)}`;

export default function Dashboard() {
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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-governor-bay"></div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-radical-red/10 border border-radical-red/20 text-radical-red rounded-xl font-medium text-center">
      {error}
    </div>
  );

  return (
    <main className="max-w-6xl mx-auto w-full p-6 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Freelancer Dashboard</h1>

      {/* Summary Card */}
      <section aria-label="Total earnings" className="mb-10">
        <div className="bg-gradient-to-br from-governor-bay to-indigo-900 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-indigo-200 font-medium mb-2 uppercase tracking-wider text-sm">Total Earnings</h2>
            <p data-testid="total-earnings" className="text-5xl font-black text-white mb-2">
              {rand(summary.totalIncome)}
            </p>
            <p className="text-caribbean-green font-medium">
              {summary.transactionCount} successful transaction(s)
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10">
            <svg className="w-48 h-48 -mb-10 -mr-10" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bookings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
          </div>
          {bookings.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm">
                  <tr>
                    <th className="p-4 font-semibold">Gig</th>
                    <th className="p-4 font-semibold">Client</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-900 font-medium">{b.gig?.title}</td>
                      <td className="p-4 text-gray-600">{b.client?.name}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          b.status === 'Confirmed' ? 'bg-caribbean-green/10 text-caribbean-green' :
                          b.status === 'Declined' ? 'bg-radical-red/10 text-radical-red' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm whitespace-nowrap">{new Date(b.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Transactions</h2>
          </div>
          {transactions.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm">
                  <tr>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Client</th>
                    <th className="p-4 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-500 text-sm whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-gray-600">{t.client?.name}</td>
                      <td className="p-4 text-gray-900 font-bold">{rand(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}