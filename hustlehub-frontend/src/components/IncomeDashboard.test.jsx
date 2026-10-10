import { render, screen } from '@testing-library/react';
import { vi, afterEach, test, expect } from 'vitest';
import Dashboard from './Dashboard';

const mockFetch = () =>
  vi.fn((url) => {
    const data = {
      summary: { totalIncome: 1500, transactionCount: 2, monthly: [] },
      transactions: [
        { _id: 't1', amount: 500, createdAt: '2026-10-01', client: { name: 'Thabo' } },
      ],
      bookings: [
        {
          _id: 'b1',
          status: 'confirmed',
          createdAt: '2026-10-01',
          gig: { title: 'Logo Design' },
          client: { name: 'Thabo' },
        },
      ],
    };
    const key = ['summary', 'transactions', 'bookings'].find((k) => url.includes(k));
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: data[key] }),
    });
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

test('renders total earnings, bookings and transactions', async () => {
  vi.stubGlobal('fetch', mockFetch());
  render(<Dashboard />);

  expect(await screen.findByTestId('total-earnings')).toHaveTextContent('R1500.00');
  expect(screen.getByText('Logo Design')).toBeInTheDocument();
  expect(screen.getByText('R500.00')).toBeInTheDocument();
});

test('shows a safe error message when the API fails', async () => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 500 })));
  render(<Dashboard />);

  expect(await screen.findByRole('alert')).toHaveTextContent(/could not load/i);
});

test('shows an access message for non-freelancers', async () => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 403 })));
  render(<Dashboard />);

  expect(await screen.findByRole('alert')).toHaveTextContent(/only freelancers/i);
});