import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { format } from 'date-fns';

export default function AddTransactionModal({ onClose, onSuccess, editTx }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    type: editTx?.type || 'expense',
    amount: editTx?.amount || '',
    note: editTx?.note || '',
    date: editTx ? format(new Date(editTx.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    categoryId: editTx?.categoryId || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || +form.amount <= 0) return toast.error('Sahi amount daalo');
    setLoading(true);
    try {
      if (editTx) {
        await api.put(`/transactions/${editTx.id}`, form);
        toast.success('Transaction update ho gaya!');
      } else {
        await api.post('/transactions', form);
        toast.success('Transaction add ho gaya! ✅');
      }
      onSuccess();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Kuch galat hua');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">
          <span>{editTx ? 'Transaction Edit Karo' : 'Naya Transaction Jodo'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type toggle */}
          <div className="type-toggle">
            <button type="button" className={`type-btn ${form.type === 'income' ? 'active-income' : ''}`} onClick={() => setForm({ ...form, type: 'income' })}>
              ↑ Aaya (Income)
            </button>
            <button type="button" className={`type-btn ${form.type === 'expense' ? 'active-expense' : ''}`} onClick={() => setForm({ ...form, type: 'expense' })}>
              ↓ Gaya (Expense)
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input
              className="form-input"
              type="number"
              placeholder="0"
              value={form.amount}
              onChange={set('amount')}
              min="1"
              required
              style={{ fontSize: '1.25rem', fontWeight: 600 }}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={form.date} onChange={set('date')} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.categoryId} onChange={set('categoryId')}>
                <option value="">Select karo</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <input className="form-input" placeholder="Big Bazaar, petrol, etc." value={form.note} onChange={set('note')} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${form.type === 'income' ? 'btn-success' : 'btn-primary'}`}
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Save ho raha hai...' : editTx ? 'Update Karo' : 'Save Karo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
