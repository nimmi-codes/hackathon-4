import { useEffect, useState } from 'react';
import { api, fmtDate } from '../api.js';
import { Badge, EmptyState, PageHeader, Skeleton, Stepper, useConfirm, useToast } from '../components/UI.jsx';

const CLAIM_STEPS = ['Submitted', 'Verified', 'Returned'];
const CLAIM_REACHED = { Pending: 0, Verified: 1, Returned: 2 };

export default function MyReports() {
  const toast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState(null);

  const load = async () => {
    const [items, claims] = await Promise.all([api('/items/mine'), api('/claims/mine')]);
    const all = [
      ...items.map((i) => ({
        id: i._id,
        kind: i.type === 'lost' ? 'Lost' : 'Found',
        name: i.name,
        detail: `${i.location} · ${fmtDate(i.date)}`,
        status: i.status,
        created: i.createdAt,
        path: `/items/${i._id}`,
      })),
      ...claims.map((c) => ({
        id: c._id,
        kind: 'Claim',
        name: c.item?.name || '(item removed)',
        detail: c.proof,
        status: c.status,
        created: c.createdAt,
        path: `/claims/${c._id}`,
      })),
    ];
    setRows(all.sort((a, b) => new Date(b.created) - new Date(a.created)));
  };

  useEffect(() => {
    load().catch((e) => {
      setRows([]);
      toast.error(e.message);
    });
  }, []);

  const remove = async (r) => {
    if (!(await confirm(`Delete this ${r.kind.toLowerCase()} report?`))) return;
    try {
      await api(r.path, { method: 'DELETE' });
      setRows(rows.filter((x) => !(x.id === r.id && x.kind === r.kind)));
      toast.success('Report deleted');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <PageHeader title="My" accent="reports" sub="Track your lost reports, found reports and claims." />
      {rows === null && <Skeleton variant="row" count={4} />}
      {rows?.length === 0 && <EmptyState title="No reports yet" hint="Reports and claims you submit will show up here." />}
      {rows?.length > 0 && (
        <div className="table-wrap glass">
          <table>
            <thead>
              <tr><th>Type</th><th>Item</th><th>Details</th><th>Date</th><th>Status</th><th><span className="sr">Actions</span></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.kind + r.id}>
                  <td>{r.kind}</td>
                  <td>{r.name}</td>
                  <td>
                    {r.detail}
                    {r.kind === 'Claim' && <Stepper steps={CLAIM_STEPS} reached={CLAIM_REACHED[r.status]} />}
                  </td>
                  <td>{fmtDate(r.created)}</td>
                  <td><Badge status={r.status} /></td>
                  <td>
                    {r.status === 'Pending' && (
                      <button className="btn small danger" onClick={() => remove(r)}>Delete</button>
                    )}
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
