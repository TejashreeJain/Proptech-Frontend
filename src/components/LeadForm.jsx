import { useState } from 'react';

const PROPERTY_TYPES = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Plot', 'Villa', 'Commercial'];
const SOURCES = ['Facebook', 'Google', 'Referral', 'Walk-in', 'Website', 'Other'];

export default function LeadForm({ onSubmit, initialData = {}, submitLabel = 'Create Lead' }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    budget: initialData.budget || '',
    location: initialData.location || '',
    propertyType: initialData.propertyType || '1 BHK',
    source: initialData.source || 'Facebook',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Client-side validation
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 2) newErrors.name = 'Min 2 characters';

    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^[0-9+\-\s()]{7,20}$/.test(formData.phone))
      newErrors.phone = 'Invalid phone number';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = 'Invalid email';

    if (formData.budget === '' || formData.budget === null)
      newErrors.budget = 'Budget is required';
    else if (isNaN(formData.budget) || Number(formData.budget) < 0)
      newErrors.budget = 'Budget must be a positive number';

    if (!formData.location.trim()) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({ ...formData, budget: Number(formData.budget) });
    } catch (err) {
      // Handle API errors returned from backend
      if (err.response?.data?.errors) {
        const apiErrors = {};
        err.response.data.errors.forEach((e) => {
          apiErrors[e.field] = e.message;
        });
        setErrors(apiErrors);
      } else {
        alert(err.response?.data?.message || 'Something went wrong');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label>Name *</label>
          <input name="name" value={formData.name} onChange={handleChange} />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Phone *</label>
          <input name="phone" value={formData.phone} onChange={handleChange} />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Budget (₹) *</label>
          <input name="budget" type="number" value={formData.budget} onChange={handleChange} />
          {errors.budget && <span className="error-text">{errors.budget}</span>}
        </div>

        <div className="form-group">
          <label>Location *</label>
          <input name="location" value={formData.location} onChange={handleChange} />
          {errors.location && <span className="error-text">{errors.location}</span>}
        </div>

        <div className="form-group">
          <label>Property Type *</label>
          <select name="propertyType" value={formData.propertyType} onChange={handleChange}>
            {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Source *</label>
          <select name="source" value={formData.source} onChange={handleChange}>
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
