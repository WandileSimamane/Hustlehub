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

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>Freelancer Dashboard</h1>

      <section aria-label="Total earnings">
        <div style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
          <h2>Total Earnings</h2>
          <p data-testid="total-earnings" style={{ fontSize: 32, margin: 0 }}>
            {rand(summary.totalIncome)}
          </p>
          <small>{summary.transactionCount} transaction(s)</small>
        </div>
      </section>

      <h2>Bookings Received</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <table style={{ width: '100%' }}>
          <thead>
            <tr><th>Gig</th><th>Client</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.gig?.title}</td>
                <td>{b.client?.name}</td>
                <td>{b.status}</td>
                <td>{new Date(b.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <table style={{ width: '100%' }}>
          <thead>
            <tr><th>Date</th><th>Client</th><th>Amount</th></tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id}>
                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                <td>{t.client?.name}</td>
                <td>{rand(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}