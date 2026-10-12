import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../api';
import GigFeed from './GigFeed';
import GigForm from './GigForm';

// Stub out API calls to prevent real network requests during tests
vi.mock('../api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const sampleGigs = [
  {
    _id: '1',
    title: 'Logo design',
    description: 'I will design a clean logo for your business.',
    category: 'Design',
    price: 500,
    deliveryDays: 3,
    owner: { name: 'Thandi' },
  },
  {
    _id: '2',
    title: 'Math tutoring',
    description: 'One-on-one tutoring for first-year students.',
    category: 'Tutoring',
    price: 150,
    deliveryDays: 1,
    owner: { name: 'Sipho' },
  },
];

const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Logo design' } });
  fireEvent.change(screen.getByLabelText(/description/i), {
    target: { value: 'I will design a clean logo' },
  });
  fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '500' } });
  fireEvent.change(screen.getByLabelText(/delivery/i), { target: { value: '3' } });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GigFeed', () => {
  it('shows the gigs returned by the API', async () => {
    api.get.mockResolvedValue({ data: { success: true, count: 2, gigs: sampleGigs } });

    render(<GigFeed />);

    expect(await screen.findByText('Logo design')).toBeInTheDocument();
    expect(screen.getByText('Math tutoring')).toBeInTheDocument();
    expect(screen.getByText(/Offered by Thandi/)).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/api/gigs', { params: {} });
  });

  it('shows a friendly message when there are no gigs', async () => {
    api.get.mockResolvedValue({ data: { success: true, count: 0, gigs: [] } });

    render(<GigFeed />);

    expect(await screen.findByText(/No gigs here yet/i)).toBeInTheDocument();
  });

  it('shows an error when the API cannot be reached', async () => {
    api.get.mockRejectedValue(new Error('Network Error'));

    render(<GigFeed />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/Could not load gigs/i);
  });
});

describe('GigForm', () => {
  it('blocks invalid input without calling the API', () => {
    render(<GigForm />);

    fireEvent.click(screen.getByRole('button', { name: /create gig/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Title must be at least 3 characters.');
    expect(api.post).not.toHaveBeenCalled();
  });

  it('submits a valid gig and confirms it', async () => {
    api.post.mockResolvedValue({ data: { success: true, gig: { _id: '9' } } });

    render(<GigForm />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /create gig/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/gigs', {
        title: 'Logo design',
        description: 'I will design a clean logo',
        category: 'Design',
        price: 500,
        deliveryDays: 3,
      });
    });
    expect(await screen.findByRole('status')).toHaveTextContent('Gig created.');
  });

  it('shows the RBAC rejection when a non-freelancer tries to create a gig', async () => {
    api.post.mockRejectedValue({
      response: {
        status: 403,
        data: { message: 'Forbidden: your role is not allowed to perform this action.' },
      },
    });

    render(<GigForm />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /create gig/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/your role is not allowed/i);
  });
});