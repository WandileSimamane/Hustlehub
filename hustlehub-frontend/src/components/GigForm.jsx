import { useState } from 'react';
import api from '../api';
import { CATEGORIES } from '../gigUtils';
import './gigs.css';

const emptyForm = {
  title: '',
  description: '',
  category: CATEGORIES[0],
  price: '',
  deliveryDays: '',
};

// Turns an API failure into messages that are safe to show (no stack traces or internals).
function readErrors(err) {
  const { status, data } = err.response || {};
  if (!status) return ['Cannot reach the server. Check your connection and try again.'];
  if (status === 401) return ['Please log in before creating a gig.'];
  if (status === 403) return [data?.message || data?.error || 'You are not allowed to do this.'];
  if (Array.isArray(data?.errors)) return data.errors.map((e) => e.msg);
  return [data?.message || 'Something went wrong. Please try again.'];
}

export default function GigForm({ onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors([]);
    setSuccess('');

    // Quick checks for instant feedback. The server validates everything again.
    const problems = [];
    const days = Number(form.deliveryDays);
    if (form.title.trim().length < 3) problems.push('Title must be at least 3 characters.');
    if (form.description.trim().length < 10) problems.push('Description must be at least 10 characters.');
    if (!(Number(form.price) >= 1)) problems.push('Price must be at least 1.');
    if (!Number.isInteger(days) || days < 1 || days > 90) {
      problems.push('Delivery time must be a whole number from 1 to 90 days.');
    }
    if (problems.length > 0) {
      setErrors(problems);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/api/gigs', {
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        deliveryDays: days,
      });
      setSuccess('Gig created.');
      setForm(emptyForm);
      if (onCreated) onCreated(res.data.gig);
    } catch (err) {
      setErrors(readErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="gig-section" aria-labelledby="gig-form-title">
      <h2 id="gig-form-title">Create a gig</h2>

      <form className="gig-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="gig-title">
          Title
          <input id="gig-title" name="title" type="text" value={form.title} onChange={handleChange} />
        </label>

        <label htmlFor="gig-description">
          Description
          <textarea
            id="gig-description"
            name="description"
            rows={5}
            value={form.description}
            onChange={handleChange}
          />
        </label>

        <label htmlFor="gig-category">
          Category
          <select id="gig-category" name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="gig-price">
          Price (R)
          <input
            id="gig-price"
            name="price"
            type="number"
            min="1"
            step="0.01"
            value={form.price}
            onChange={handleChange}
          />
        </label>

        <label htmlFor="gig-days">
          Delivery time (days)
          <input
            id="gig-days"
            name="deliveryDays"
            type="number"
            min="1"
            max="90"
            step="1"
            value={form.deliveryDays}
            onChange={handleChange}
          />
        </label>

        {errors.length > 0 && (
          <div role="alert">
            {errors.map((message) => (
              <p className="gig-error" key={message}>
                {message}
              </p>
            ))}
          </div>
        )}
        {success && (
          <p className="gig-success" role="status">
            {success}
          </p>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating gig...' : 'Create gig'}
        </button>
      </form>
    </section>
  );
}