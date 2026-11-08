import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'https://localhost:5000';
const rand = (n) => `R${Number(n || 0).toFixed(2)}`;
const PIE_COLORS = ['#00cc99', '#ff355e']; // net take-home, estimated tax

// Group transactions by month so the bar chart works from data already loaded
const groupByMonth = (transactions) => {
  const totals = {};
  transactions.forEach((t) => {
    const d = new Date(t.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    totals[key] = (totals[key] || 0) + Number(t.amount || 0);
  });
  return Object.keys(totals)
    .sort()
    .map((month) => ({ month, income: Math.round(totals[month] * 100) / 100 }));
};

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

    // Gather summary, transactions, and bookings synchronously
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

  const monthly = useMemo(() => groupByMonth(transactions), [transactions]);

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

  // Gross falls back to totalIncome so the page still works before the tax fields exist
  const gross = summary.grossIncome ?? summary.totalIncome ?? 0;
  const hasTax = summary.estimatedTax !== undefined && summary.netIncome !== undefined;
  const tax = summary.estimatedTax ?? 0;
  const net = summary.netIncome ?? gross;
  const pieData = [
    { name: 'Net take-home', value: net },
    { name: 'Estimated tax', value: tax },
  ];

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Freelancer Dashboard</h1>
            <p className="text-gray-500 mt-1">Overview of your earnings and recent activity</p>
          </div>
          <Link to="/manage-gigs" className="mt-4 md:mt-0 bg-[#00cc99] hover:bg-[#00b386] text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Create New Gig
          </Link>
        </div>

        {/* Gross / Tax / Net summary */}
        <section aria-label="Income summary" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
              <h2 className="text-gray-500 font-semibold text-sm">Gross income</h2>
              <p data-testid="total-earnings" className="text-4xl font-black text-[#393bc6] tracking-tight mt-2">
                {rand(gross)}
              </p>
              <small className="block mt-2 text-gray-500 font-medium">
                {summary.transactionCount} successful transaction(s)
              </small>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
              <h2 className="text-gray-500 font-semibold text-sm">Estimated tax</h2>
              <p data-testid="estimated-tax" className="text-4xl font-black text-[#ff355e] tracking-tight mt-2">
                {hasTax ? rand(tax) : '—'}
              </p>
              <small className="block mt-2 text-gray-500 font-medium">
                {hasTax ? `${summary.effectiveRate ?? 0}% effective rate` : 'Tax estimate unavailable'}
              </small>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
              <h2 className="text-gray-500 font-semibold text-sm">Net take-home pay</h2>
              <p data-testid="net-income" className="text-4xl font-black text-[#00cc99] tracking-tight mt-2">
                {hasTax ? rand(net) : '—'}
              </p>
              <small className="block mt-2 text-gray-500 font-medium">After estimated tax</small>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section aria-label="Income charts" className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900">Where your income goes</h2>
              <p className="text-sm text-gray-500 mt-1 mb-4">Net take-home compared with estimated tax</p>
              {hasTax && gross > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => rand(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">No income to chart yet.</div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900">Income by month</h2>
              <p className="text-sm text-gray-500 mt-1 mb-4">Gross income from confirmed transactions</p>
              {monthly.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(v) => rand(v)} />
                      <Bar dataKey="income" name="Gross income" fill="#393bc6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">No transactions to chart yet.</div>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Tax is an estimate based on confirmed income and is not professional tax advice.
          </p>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

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

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Transactions</h2>
                <p className="text-sm text-gray-500 mt-1">Payment history</p>
              </div>
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