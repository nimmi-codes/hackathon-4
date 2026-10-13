import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtDate } from '../api.js';
import { Badge, EmptyState, PageHeader, Skeleton, useToast } from '../components/UI.jsx';

export default function Dashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([api('/items'), api('/claims')])
      .then(([items, claims]) => setData({ items, claims }))
      .catch((e) => {
        setData({ items: [], claims: [] });
        toast.error(e.message);
      });
  }, []);

  if (!data) {
    return (
      <>
        <PageHeader tag="Staff portal" title="Admin" accent="dashboard" />
        <Skeleton count={4} />
      </>
    );
  }

  const { items, claims } = data;
  const stats = [
    ['Lost reports', items.filter((i) => i.type === 'lost').length],
    ['Found items', items.filter((i) => i.type === 'found').length],
    ['Awaiting approval', items.filter((i) => i.status === 'Pending').length],
    ['Pending claims', claims.filter((c) => c.status === 'Pending').length],
  ];

  return (
    <>
      <PageHeader tag="Staff portal" title="Admin" accent="dashboard" sub="A quick look at what needs attention." />
      <div className="grid stats">
        {stats.map(([label, n]) => (
          <div className="card glass stat" key={label}>
            <span className="stat-n">{n}</span>
            <span className="muted">{label}</span>
          </div>
        ))}
      </div>

      <div className="row between section-head">
        <h2>Recent <em>claims</em></h2>
        <Link to="/admin/claims" className="btn small ghost">All claims</Link>
      </div>
      {claims.length === 0 ? (
        <EmptyState title="No claims yet" />
      ) : (
        <div className="table-wrap glass">
          <table>
            <thead><tr><th>Item</th><th>Claimant</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {claims.slice(0, 5).map((c) => (
                <tr key={c._id}>
                  <td>{c.item?.name || '(removed)'}</td>
                  <td>{c.claimant?.name}</td>
                  <td>{fmtDate(c.createdAt)}</td>
                  <td><Badge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
