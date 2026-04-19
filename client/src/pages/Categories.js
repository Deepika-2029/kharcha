import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

const ICONS = ['🛒','💡','📚','💊','🚗','🎬','👕','📦','🏠','✈️','🍔','💰','🎓','🏥','📱','⛽'];
const COLORS = ['#10b981','#6366f1','#ef4444','#f59e0b','#3b82f6','#8b5cf6','#ec4899','#6b7280','#14b8a6','#f97316'];

function CategoryModal({ cat, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: cat?.name || '',
    icon: cat?.icon || '📦',
    color: cat?.color || '#6366f1',
    budgetLimit: cat?.budgetLimit || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Naam daalo');
    setLoading(true);
    try {
      if (cat) {
        await api.put(`/categories/${cat.id}`, form);
        toast.success('Category update ho gayi!');
      } else {
        await api.post('/categories', form);
        toast.success('Category ban gayi! ✅');
      }
      onSuccess();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error hua');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">
          <span>{cat ? 'Category Edit Karo' : 'Naya Category'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Naam</label>
            <input className="form-input" placeholder="e.g. Roti & Sabzi" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Icon chuno</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {ICONS.map(icon => (
                <button key={icon} type="button"
                  style={{ width: 40, height: 40, fontSize: 20, border: form.icon === icon ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', background: form.icon === icon ? 'var(--primary-light)' : 'white' }}
                  onClick={() => setForm({ ...form, icon })}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Color chuno</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COLORS.map(color => (
                <button key={color} type="button"
                  style={{ width: 32, height: 32, borderRadius: '50%', background: color, border: form.color === color ? '3px solid #1e293b' : '2px solid transparent', cursor: 'pointer' }}
                  onClick={() => setForm({ ...form, color })} />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Budget Limit (₹) — optional</label>
            <input className="form-input" type="number" placeholder="e.g. 8000" value={form.budgetLimit} onChange={e => setForm({ ...form, budgetLimit: e.target.value })} min="0" />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Save ho raha hai...' : cat ? 'Update Karo' : 'Banao'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);

  const fetchCats = async () => {
    const res = await api.get('/categories');
    setCategories(res.data);
  };

  useEffect(() => { fetchCats(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete karna chahte ho? Iske transactions ka category hata dega.')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast?.success?.('Delete ho gaya');
      fetchCats();
    } catch { }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Kharche ko organize karo</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Naya Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {categories.map(cat => (
          <div key={cat.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: cat.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {cat.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {cat.budgetLimit > 0 ? `Budget: ${fmt(cat.budgetLimit)}/mo` : 'No budget set'}
                </div>
              </div>
            </div>

            {cat.budgetLimit > 0 && (
              <div style={{ width: '100%', height: 4, background: 'var(--border)', borderRadius: '999px' }}>
                <div style={{ height: '100%', width: '0%', background: cat.color, borderRadius: '999px', transition: 'width 0.5s' }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem' }} onClick={() => setEditCat(cat)}>
                <Pencil size={12} /> Edit
              </button>
              <button className="btn btn-danger" style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem' }} onClick={() => handleDelete(cat.id)}>
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}

        {/* Add new tile */}
        <button
          style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: '1.25rem', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Naya Category Jodo
        </button>
      </div>

      {(showModal || editCat) && (
        <CategoryModal
          cat={editCat}
          onClose={() => { setShowModal(false); setEditCat(null); }}
          onSuccess={() => { setShowModal(false); setEditCat(null); fetchCats(); }}
        />
      )}
    </div>
  );
}
