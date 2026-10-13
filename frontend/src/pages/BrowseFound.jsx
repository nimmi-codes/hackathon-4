import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api, fmtDate } from '../api.js';
import { Badge, EmptyState, Modal, PageHeader, Photo, Skeleton, Stepper, useToast } from '../components/UI.jsx';

const empty = { q: '', category: '', location: '', date: '' };
const STEPS = ['Reported', 'Found', 'Claim Submitted', 'Verified', 'Returned'];

// "Found 3 hrs ago" / "Found 2 days ago" from the date found
function foundAgo(date) {
  const hrs = Math.max(0, Math.floor((Date.now() - new Date(date)) / 36e5));
  if (hrs < 24) return `Found ${Math.max(hrs, 1)} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `Found ${days} day${days > 1 ? 's' : ''} ago`;
}

function reachedStep(item, claim) {
  if (item.status === 'Returned') return 4;
  if (!claim) return 1;
  return { Pending: 2, Verified: 3, Returned: 4 }[claim.status];
}

const list = { show: { transition: { staggerChildren: 0.06 } } };
const rise = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function BrowseFound() {
  const toast = useToast();
  const [filters, setFilters] = useState(empty);
  const [items, setItems] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [myClaims, setMyClaims] = useState({});
  const [suggest, setSuggest] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [selected, setSelected] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [claim, setClaim] = useState({ proof: '', contact: '' });
  const results = useRef(null);

  const loadClaims = () =>
    api('/claims/mine')
      .then((cs) => setMyClaims(Object.fromEntries(cs.filter((c) => c.item).map((c) => [c.item._id, c]))))
      .catch(() => {});

  const search = (f = filters, scroll = false) => {
    const params = new URLSearchParams(Object.entries(f).filter(([, v]) => v));
    setItems(null);
    api('/items/found?' + params)
      .then((d) => {
        setItems(d);
        if (scroll) setTimeout(() => results.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      })
      .catch((e) => {
        setItems([]);
        toast.error(e.message);
      });
  };

  useEffect(() => {
    search();
    loadClaims();
    api('/categories').then(setCategories).catch(() => {});
    // all known locations feed the autocomplete
    api('/items/found').then((all) => setLocations([...new Set(all.map((i) => i.location))])).catch(() => {});
  }, []);

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  const matches = useMemo(
    () => (filters.location ? locations.filter((l) => l.toLowerCase().includes(filters.location.toLowerCase()) && l !== filters.location) : locations).slice(0, 6),
    [locations, filters.location]
  );

  const close = () => {
    setSelected(null);
    setClaiming(false);
    setClaim({ proof: '', contact: '' });
  };

  const submitClaim = async (e) => {
    e.preventDefault();
    try {
      await api('/claims', { method: 'POST', body: { itemId: selected._id, ...claim } });
      close();
      toast.success('Claim submitted');
      loadClaims();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <PageHeader title="Find your" accent="item" after="in seconds" sub="Search items that have been handed in across Sri Lanka." />

      <form
        className="searchbar glass"
        onSubmit={(e) => {
          e.preventDefault();
          setSuggest(false);
          search(filters, true);
        }}
      >
        <input aria-label="Keyword" placeholder="Keyword" value={filters.q} onChange={set('q')} />
        <div className="autocomplete">
          <input
            aria-label="Location"
            placeholder="Location"
            value={filters.location}
            autoComplete="off"
            onChange={(e) => {
              set('location')(e);
              setSuggest(true);
            }}
            onFocus={() => setSuggest(true)}
            onBlur={() => setTimeout(() => setSuggest(false), 120)}
            onKeyDown={(e) => e.key === 'Escape' && setSuggest(false)}
          />
          {suggest && matches.length > 0 && (
            <ul className="suggestions glass" role="listbox">
              {matches.map((l) => (
                <li key={l} role="option">
                  <button type="button" onMouseDown={() => setFilters({ ...filters, location: l })}>{l}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <select aria-label="Category" value={filters.category} onChange={set('category')}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id}>{c.name}</option>
          ))}
        </select>
        <input aria-label="Date found" type="date" value={filters.date} onChange={set('date')} />
        <button className="btn">Search</button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setFilters(empty);
            search(empty, true);
          }}
        >
          Clear
        </button>
      </form>

      <div ref={results} className="results">
        {items === null && <Skeleton count={6} />}
        {items?.length === 0 && <EmptyState title="No items found" hint="Try a different keyword, location or category." />}
        {items?.length > 0 && (
          <motion.div className="grid" variants={list} initial="hidden" animate="show" key={items.map((i) => i._id).join()}>
            {items.map((it) => {
              const open = expanded === it._id;
              return (
                <motion.article className="card glass item" variants={rise} whileHover={{ y: -4 }} key={it._id}>
                  <Photo url={it.imageUrl} name={it.name} />
                  <div className="row between">
                    <span className="ago">{foundAgo(it.date)}</span>
                    <Badge status={it.status} />
                  </div>
                  <button className="card-toggle" aria-expanded={open} onClick={() => setExpanded(open ? null : it._id)}>
                    <h3>{it.name}</h3>
                    <p className="muted small">{it.category} · {it.location}</p>
                    <p className="small">Found {fmtDate(it.date)}</p>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="timeline-wrap"
                      >
                        <Stepper vertical steps={STEPS} reached={reachedStep(it, myClaims[it._id])} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button className="btn small" onClick={() => setSelected(it)}>View Details</button>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <Modal onClose={close}>
            <Photo url={selected.imageUrl} name={selected.name} />
            <h3>{selected.name}</h3>
            <p>{selected.description || 'No description.'}</p>
            <p className="small muted">
              {selected.category} · {selected.location} · Found {fmtDate(selected.date)}
            </p>
            {!claiming ? (
              <button className="btn" onClick={() => setClaiming(true)}>Claim this item</button>
            ) : (
              <form className="form" onSubmit={submitClaim}>
                <label>
                  Proof / description of the item
                  <textarea required rows={3} value={claim.proof} onChange={(e) => setClaim({ ...claim, proof: e.target.value })} />
                </label>
                <label>
                  Contact (phone or email)
                  <input required value={claim.contact} onChange={(e) => setClaim({ ...claim, contact: e.target.value })} />
                </label>
                <button className="btn">Submit Claim</button>
              </form>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
