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

    // Fetch all dashboard metrics concurrently to avoid waterfall delays
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
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#393bc6]"></div>
    </div>
  );
  if (error) return <p role="alert" className="bg-red-50 text-[#ff355e] p-4 rounded-xl border border-red-100 font-medium text-center">{error}</p>;

  return (
    <main className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Freelancer Dashboard</h1>

      <section aria-label="Total earnings" className="mb-10">
        <div className="bg-gradient-to-br from-[#393bc6] to-[#2e30a8] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <h2 className="text-lg font-medium text-blue-100 mb-2 uppercase tracking-wide">Total Earnings</h2>
          <p data-testid="total-earnings" className="text-5xl font-black mb-2">
            {rand(summary.totalIncome)}
          </p>
          <p className="text-blue-200 text-sm">{summary.transactionCount} successful transaction(s)</p>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#00cc99]"></span>
            Recent Bookings
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {bookings.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No bookings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                      <th className="p-4 font-semibold">Gig</th>
                      <th className="p-4 font-semibold">Client</th>
                      <th className="p-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{b.gig?.title}</td>
                        <td className="p-4 text-gray-600">{b.client?.name}</td>
                        <td className="p-4">
                          {/* Color code status pills */}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            b.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                            b.status === 'Declined' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {b.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff355e]"></span>
            Transactions
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {transactions.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No transactions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Client</th>
                      <th className="p-4 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((t) => (
                      <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-500 text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-gray-600">{t.client?.name}</td>
                        <td className="p-4 font-bold text-gray-900">{rand(t.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}