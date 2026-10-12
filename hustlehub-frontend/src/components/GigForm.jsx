import { useState } from 'react';
import api from '../api';
import { CATEGORIES, decodeEntities } from '../gigUtils';

const emptyForm = {
  title: '',
  description: '',
  category: CATEGORIES[0],
  price: '',
  deliveryDays: '',
};

// Normalize API error responses into an array of strings
function readErrors(err) {
  const { status, data } = err.response || {};
  if (!status) return ['Cannot reach the server. Check your connection and try again.'];
  if (status === 401) return ['Please log in before saving a gig.'];
  if (status === 403) return [data?.message || data?.error || 'You are not allowed to do this.'];
  if (Array.isArray(data?.errors)) return data.errors.map((e) => e.msg);
  return [data?.message || 'Something went wrong. Please try again.'];
}

function toForm(gig) {
  if (!gig) return emptyForm;
  return {
    title: decodeEntities(gig.title),
    description: decodeEntities(gig.description),
    category: gig.category,
    price: String(gig.price),
    deliveryDays: String(gig.deliveryDays),
  };
}

export default function GigForm({ gig, onCreated, onCancel }) {
  const isEdit = Boolean(gig);
  const [form, setForm] = useState(() => toForm(gig));
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

    // Pre-flight client-side validation to catch bad input early
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

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      deliveryDays: days,
    };

    setSubmitting(true);
    try {
      // Toggle between update and create based on component props
      const res = isEdit
        ? await api.put(`/api/gigs/${gig._id}`, payload)
        : await api.post('/api/gigs', payload);
        
      setSuccess(isEdit ? 'Gig updated.' : 'Gig created.');
      if (!isEdit) setForm(emptyForm);
      if (onCreated) onCreated(res.data.gig);
    } catch (err) {
      setErrors(readErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#393bc6] focus:ring-2 focus:ring-[#393bc6]/20 transition-all outline-none bg-white";
  const labelClass = "block text-sm font-bold text-gray-700 mb-1 mt-4";

  return (
    <section aria-labelledby="gig-form-title" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-10">
      <h2 id="gig-form-title" className="text-2xl font-black text-gray-900 mb-6">
        {isEdit ? 'Edit gig' : 'Create a gig'}
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="gig-title" className={labelClass}>Title</label>
        <input id="gig-title" name="title" type="text" value={form.title} onChange={handleChange} className={inputClass} />

        <label htmlFor="gig-description" className={labelClass}>Description</label>
        <textarea id="gig-description" name="description" rows={4} value={form.description} onChange={handleChange} className={inputClass} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="gig-category" className={labelClass}>Category</label>
            <select id="gig-category" name="category" value={form.category} onChange={handleChange} className={inputClass}>
              {CATEGORIES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gig-price" className={labelClass}>Price (R)</label>
            <input id="gig-price" name="price" type="number" min="1" step="0.01" value={form.price} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label htmlFor="gig-days" className={labelClass}>Delivery time (days)</label>
            <input id="gig-days" name="deliveryDays" type="number" min="1" max="90" step="1" value={form.deliveryDays} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        {errors.length > 0 && (
          <div role="alert" className="mt-6 p-4 bg-red-50 text-[#ff355e] text-sm font-medium rounded-xl border border-red-100">
            {errors.map((message) => <p key={message}>{message}</p>)}
          </div>
        )}
        
        {success && (
          <div role="status" className="mt-6 p-4 bg-green-50 text-[#00cc99] text-sm font-medium rounded-xl border border-green-100">
            {success}
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button type="submit" disabled={submitting} className="flex-1 py-4 bg-[#393bc6] hover:bg-[#2e30a8] text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-70">
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create gig'}
          </button>
          
          {isEdit && onCancel && (
            <button type="button" onClick={onCancel} className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}