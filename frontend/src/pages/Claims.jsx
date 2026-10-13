import { useEffect, useState } from 'react';
import { api, fmtDate } from '../api.js';
import { Badge, EmptyState, PageHeader, Skeleton, useToast } from '../components/UI.jsx';

export default function Claims() {
  const toast = useToast();
  const [claims, setClaims] = useState(null);

  useEffect(() => {
    api('/claims')
      .then(setClaims)
      .catch((e) => {
        setClaims([]);
        toast.error(e.message);
      });
  }, []);

  const update = async (c, status) => {
    try {
      const upd = await api(`/claims/${c._id}`, { method: 'PUT', body: { status } });
      setClaims(claims.map((x) => (x._id === c._id ? { ...x, status: upd.status } : x)));
      toast.success('Status updated');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <PageHeader tag="Staff portal" title="Review" accent="claims" sub="Pending → Verified → Returned." />
      {claims === null && <Skeleton variant="row" count={4} />}
      {claims?.length === 0 && <EmptyState title="No claims yet" hint="Claims from customers will appear here." />}
      {claims?.length > 0 && (
        <div className="table-wrap glass">
          <table>
            <thead>
              <tr><th>Item</th><th>Claimant</th><th>Proof</th><th>Contact</th><th>Date</th><th>Status</th><th>Update</th></tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c._id}>
                  <td>{c.item?.name || '(removed)'}</td>
                  <td>{c.claimant?.name}<br /><span className="muted small">{c.claimant?.email}</span></td>
                  <td>{c.proof}</td>
                  <td>{c.contact}</td>
                  <td>{fmtDate(c.createdAt)}</td>
                  <td><Badge status={c.status} /></td>
                  <td>
                    <select aria-label="Update status" value={c.status} onChange={(e) => update(c, e.target.value)}>
                      {['Pending', 'Verified', 'Returned'].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
