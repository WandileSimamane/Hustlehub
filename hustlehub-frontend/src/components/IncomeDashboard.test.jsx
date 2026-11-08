import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, afterEach, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import IncomeDashboard from './IncomeDashboard';

// Recharts' ResponsiveContainer needs ResizeObserver, which jsdom does not provide.
// Assigned directly (not via vi.stubGlobal) so afterEach's unstubAllGlobals leaves it alone.
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <IncomeDashboard />
    </MemoryRouter>
  );

const mockFetch = (summary) =>
  vi.fn((url) => {
    const data = {
      summary,
      transactions: [
        { _id: 't1', amount: 500, createdAt: '2026-10-01', client: { name: 'Thabo' } },
      ],
      bookings: [
        {
          _id: 'b1',
          status: 'Confirmed',
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
  vi.stubGlobal('fetch', mockFetch({ totalIncome: 1500, transactionCount: 2 }));
  renderPage();

  expect(await screen.findByTestId('total-earnings')).toHaveTextContent('R1500.00');
  expect(screen.getByText('Logo Design')).toBeInTheDocument();
  expect(screen.getByText('R500.00')).toBeInTheDocument();
});

test('shows gross income, estimated tax and net take-home pay', async () => {
  vi.stubGlobal(
    'fetch',
    mockFetch({
      totalIncome: 150000,
      grossIncome: 150000,
      estimatedTax: 9180, // 150,000 x 18% = 27,000 less the 17,820 rebate
      netIncome: 140820,
      effectiveRate: 6.12,
      transactionCount: 3,
    })
  );
  renderPage();

  expect(await screen.findByTestId('total-earnings')).toHaveTextContent('R150000.00');
  expect(screen.getByTestId('estimated-tax')).toHaveTextContent('R9180.00');
  expect(screen.getByTestId('net-income')).toHaveTextContent('R140820.00');
  expect(screen.getByText(/6\.12% effective rate/i)).toBeInTheDocument();
});

test('shows a dash for tax when the backend sends no tax data', async () => {
  vi.stubGlobal('fetch', mockFetch({ totalIncome: 1500, transactionCount: 2 }));
  renderPage();

  expect(await screen.findByTestId('estimated-tax')).toHaveTextContent('—');
  expect(screen.getByTestId('net-income')).toHaveTextContent('—');
});

test('shows a safe error message when the API fails', async () => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 500 })));
  renderPage();

  expect(await screen.findByRole('alert')).toHaveTextContent(/could not load/i);
});

test('shows an access message for non-freelancers', async () => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 403 })));
  renderPage();

  expect(await screen.findByRole('alert')).toHaveTextContent(/only freelancers/i);
});