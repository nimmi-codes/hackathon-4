import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { PageHeader, useToast } from '../components/UI.jsx';

export default function ReportForm({ type }) {
  const lost = type === 'lost';
  const toast = useToast();
  const blank = { name: '', category: '', description: '', location: '', date: '', contact: '', imageUrl: '' };
  const [form, setForm] = useState(blank);
  const [categories, setCategories] = useState([]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    setForm(blank);
    api('/categories').then(setCategories).catch(() => {});
  }, [type]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api('/items', { method: 'POST', body: { ...form, type } });
      toast.success(lost ? 'Lost report submitted' : 'Found report submitted');
      setForm(blank);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <PageHeader
        tag={lost ? 'Lost something?' : 'Found something?'}
        title={lost ? 'Report a lost' : 'Report a found'}
        accent="item"
        sub={lost ? 'Tell us what went missing and how to reach you.' : 'Help it find its way back to its owner.'}
      />
      <form className="panel glass form narrow" onSubmit={submit}>
        <label>Item name<input required value={form.name} onChange={set('name')} /></label>
        <label>
          Category
          <select required value={form.category} onChange={set('category')}>
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c._id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>Description<textarea rows={3} value={form.description} onChange={set('description')} /></label>
        <label>{lost ? 'Location lost' : 'Location found'}<input required value={form.location} onChange={set('location')} /></label>
        <label>{lost ? 'Date lost' : 'Date found'}<input type="date" required value={form.date} onChange={set('date')} /></label>
        {lost ? (
          <label>Contact<input required value={form.contact} onChange={set('contact')} /></label>
        ) : (
          <label>Photo URL (optional)<input type="url" value={form.imageUrl} onChange={set('imageUrl')} /></label>
        )}
        <button className="btn block">Submit</button>
      </form>
    </>
  );
}
