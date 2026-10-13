import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { api, fmtDate, toInputDate } from '../api.js';
import { Badge, EmptyState, Modal, PageHeader, Skeleton, useConfirm, useToast } from '../components/UI.jsx';

const blank = { type: 'found', name: '', category: '', description: '', location: '', date: '', contact: '', imageUrl: '', status: 'Approved' };

export default function ManageItems() {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState(null);
  const [categories, setCategories] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [editing, setEditing] = useState(null); // form object, with _id when editing
  const [newCat, setNewCat] = useState('');
  const [catEdit, setCatEdit] = useState(null); // { id, name }

  const loadItems = () =>
    api('/items' + (typeFilter ? `?type=${typeFilter}` : ''))
      .then(setItems)
      .catch((e) => {
        setItems([]);
        toast.error(e.message);
      });
  const loadCats = () => api('/categories').then(setCategories).catch((e) => toast.error(e.message));

  useEffect(() => {
    setItems(null);
    loadItems();
  }, [typeFilter]);
  useEffect(() => {
    loadCats();
  }, []);

  const set = (k) => (e) => setEditing({ ...editing, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const isEdit = !!editing._id;
    try {
      await api(isEdit ? `/items/${editing._id}` : '/items', { method: isEdit ? 'PUT' : 'POST', body: editing });
      setEditing(null);
      toast.success(isEdit ? 'Item updated' : 'Item added');
      loadItems();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (it) => {
    if (!(await confirm(`Delete "${it.name}"? Its claims will be removed too.`))) return;
    try {
      await api(`/items/${it._id}`, { method: 'DELETE' });
      setItems(items.filter((x) => x._id !== it._id));
      toast.success('Item deleted');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const addCat = async (e) => {
    e.preventDefault();
    try {
      await api('/categories', { method: 'POST', body: { name: newCat } });
      setNewCat('');
      toast.success('Category added');
      loadCats();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const saveCat = async (e) => {
    e.preventDefault();
    try {
      await api(`/categories/${catEdit.id}`, { method: 'PUT', body: { name: catEdit.name } });
      setCatEdit(null);
      toast.success('Category updated');
      loadCats();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeCat = async (c) => {
    if (!(await confirm(`Delete category "${c.name}"?`))) return;
    try {
      await api(`/categories/${c._id}`, { method: 'DELETE' });
      toast.success('Category deleted');
      loadCats();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <PageHeader tag="Staff portal" title="Manage" accent="items" sub="Add, edit and approve lost and found items." />
      <div className="row toolbar">
        <select aria-label="Filter by type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        <span className="spacer" />
        <button className="btn" onClick={() => setEditing({ ...blank })}>Add Item</button>
      </div>

      {items === null && <Skeleton variant="row" count={5} />}
      {items?.length === 0 && <EmptyState title="No items" hint="Add an item or wait for customer reports." />}
      {items?.length > 0 && (
        <div className="table-wrap glass">
          <table>
            <thead>
              <tr><th>Type</th><th>Name</th><th>Category</th><th>Location</th><th>Date</th><th>Reported by</th><th>Status</th><th><span className="sr">Actions</span></th></tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id}>
                  <td className="cap">{it.type}</td>
                  <td>{it.name}</td>
                  <td>{it.category}</td>
                  <td>{it.location}</td>
                  <td>{fmtDate(it.date)}</td>
                  <td>{it.reporter?.name || '—'}</td>
                  <td><Badge status={it.status} /></td>
                  <td className="actions">
                    <button className="btn small ghost" onClick={() => setEditing({ ...it, date: toInputDate(it.date) })}>Edit</button>
                    <button className="btn small danger" onClick={() => remove(it)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="section-head"><h2>Cate<em>gories</em></h2></div>
      <form className="row" onSubmit={addCat}>
        <input aria-label="New category" placeholder="New category" required value={newCat} onChange={(e) => setNewCat(e.target.value)} />
        <button className="btn small">Add</button>
      </form>
      {categories.length > 0 && (
        <div className="table-wrap glass cats">
          <table>
            <thead><tr><th>Name</th><th><span className="sr">Actions</span></th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>
                    {catEdit?.id === c._id ? (
                      <form className="row" onSubmit={saveCat}>
                        <input
                          aria-label="Category name"
                          autoFocus
                          required
                          value={catEdit.name}
                          onChange={(e) => setCatEdit({ ...catEdit, name: e.target.value })}
                        />
                        <button className="btn small">Save</button>
                        <button type="button" className="btn small ghost" onClick={() => setCatEdit(null)}>Cancel</button>
                      </form>
                    ) : (
                      c.name
                    )}
                  </td>
                  <td className="actions">
                    <button className="btn small ghost" onClick={() => setCatEdit({ id: c._id, name: c.name })}>Rename</button>
                    <button className="btn small danger" onClick={() => removeCat(c)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <Modal onClose={() => setEditing(null)}>
            <form className="form" onSubmit={save}>
              <h3>{editing._id ? 'Edit Item' : 'Add Item'}</h3>
              <label>
                Type
                <select value={editing.type} onChange={set('type')}>
                  <option value="found">Found</option>
                  <option value="lost">Lost</option>
                </select>
              </label>
              <label>Name<input required value={editing.name} onChange={set('name')} /></label>
              <label>
                Category
                <select required value={editing.category} onChange={set('category')}>
                  <option value="">Select…</option>
                  {categories.map((c) => (
                    <option key={c._id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label>Description<textarea rows={2} value={editing.description} onChange={set('description')} /></label>
              <label>Location<input required value={editing.location} onChange={set('location')} /></label>
              <label>Date<input type="date" required value={editing.date} onChange={set('date')} /></label>
              <label>Contact<input value={editing.contact} onChange={set('contact')} /></label>
              <label>Photo URL<input type="url" value={editing.imageUrl} onChange={set('imageUrl')} /></label>
              <label>
                Status
                <select value={editing.status} onChange={set('status')}>
                  {['Pending', 'Approved', 'Rejected', 'Returned'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <button className="btn block">Save</button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
