import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';
import AddTransactionModal from '../components/AddTransactionModal';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
const now = new Date();

export default function Transactions() {
  const [txs, setTxs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [filters, setFilters] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    type: '',
    categoryId: '',
    search: '',
  });

  const fetchTxs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.month) params.set('month', filters.month);
      if (filters.year) params.set('year', filters.year);
      if (filters.type) params.set('type', filters.type);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      const res = await api.get(`/transactions?${params}`);
      setTxs(res.data);
    } catch (e) { toast.error('Load nahi hua'); }
    finally { setLoading(false); }
  };

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data)); }, []);
  useEffect(() => { fetchTxs(); }, [filters.month, filters.year, filters.type, filters.categoryId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete karna chahte ho?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Delete ho gaya');
      fetchTxs();
    } catch { toast.error('Delete nahi hua'); }
  };

  const filtered = txs.filter(tx => {
    if (!filters.search) return true;
    return tx.note?.toLowerCase().includes(filters.search.toLowerCase()) ||
      tx.category?.name?.toLowerCase().includes(filters.search.toLowerCase());
  });

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Sab aane-jaane ka hisaab</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Naya Jodo
        </button>
      </div>

      {/* Summary mini */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--success-light)', padding: '0.625rem 1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Aaya: </span>
          <strong style={{ color: 'var(--success)' }}>{fmt(totalIncome)}</strong>
        </div>
        <div style={{ background: 'var(--danger-light)', padding: '0.625rem 1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Gaya: </span>
          <strong style={{ color: 'var(--danger)' }}>{fmt(totalExpense)}</strong>
        </div>
        <div style={{ background: 'var(--primary-light)', padding: '0.625rem 1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Bacha: </span>
          <strong style={{ color: 'var(--primary)' }}>{fmt(totalIncome - totalExpense)}</strong>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              placeholder="Search..."
              style={{ paddingLeft: '2.25rem' }}
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={filters.month} onChange={e => setFilters({ ...filters, month: +e.target.value })}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={filters.year} onChange={e => setFilters({ ...filters, year: +e.target.value })}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
            <option value="">Sab</option>
            <option value="income">Aaya</option>
            <option value="expense">Gaya</option>
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={filters.categoryId} onChange={e => setFilters({ ...filters, categoryId: e.target.value })}>
            <option value="">Sab Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💸</div>
            <p>Koi transaction nahi mili</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Note</th>
                  <th>Category</th>
                  <th>User</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {format(new Date(tx.date), 'dd MMM yyyy')}
                    </td>
                    <td>{tx.note || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>
                      {tx.category ? (
                        <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '999px', background: tx.category.color + '22', color: tx.category.color, fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {tx.category.icon} {tx.category.name}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tx.user?.name}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      <span style={{ color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setEditTx(tx)}>
                          <Pencil size={13} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(tx.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(showAdd || editTx) && (
        <AddTransactionModal
          editTx={editTx}
          onClose={() => { setShowAdd(false); setEditTx(null); }}
          onSuccess={() => { setShowAdd(false); setEditTx(null); fetchTxs(); }}
        />
      )}
    </div>
  );
}
