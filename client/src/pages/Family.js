import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Users, X, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

function AddMemberModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/family/members', form);
      toast.success('Family member add ho gaya! 👨‍👩‍👧');
      onSuccess();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error hua');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">
          <span>Family Member Jodo</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Naam</label>
            <input className="form-input" placeholder="Priya Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="priya@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Ye credentials unhe share karo — wo in se login kar sakenge.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Add ho raha hai...' : 'Add Karo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Family() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [budget, setBudget] = useState('');
  const [editBudget, setEditBudget] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);

  const fetchMembers = async () => {
    const res = await api.get('/family/members');
    setMembers(res.data);
  };

  useEffect(() => {
    fetchMembers();
    api.get('/auth/me').then(r => setBudget(r.data.family?.monthlyBudget || ''));
  }, []);

  const saveBudget = async () => {
    setSavingBudget(true);
    try {
      await api.put('/family/budget', { monthlyBudget: budget });
      toast.success('Budget set ho gaya! ✅');
      setEditBudget(false);
    } catch { toast.error('Error hua'); }
    finally { setSavingBudget(false); }
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Family Management</h1>
        <p className="page-subtitle">Family ke members aur budget manage karo</p>
      </div>

      {/* Monthly budget setting */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: 40, height: 40, background: 'var(--primary-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={18} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Monthly Family Budget</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Poore ghar ka monthly budget set karo</div>
          </div>
        </div>

        {editBudget ? (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 50000"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              style={{ maxWidth: 200 }}
            />
            <button className="btn btn-primary" onClick={saveBudget} disabled={savingBudget}>
              {savingBudget ? 'Save...' : 'Save Karo'}
            </button>
            <button className="btn btn-outline" onClick={() => setEditBudget(false)}>Cancel</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
              {budget ? fmt(budget) : 'Set nahi hai'}
            </span>
            <button className="btn btn-outline" onClick={() => setEditBudget(true)}>Edit</button>
          </div>
        )}
      </div>

      {/* Members */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} />
            <span className="card-title">Family Members ({members.length})</span>
          </div>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }} onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Add Member
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {members.map((m, i) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 0', borderBottom: i < members.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: avatarColors[i % avatarColors.length] + '22',
                color: avatarColors[i % avatarColors.length],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.9rem',
                border: `2px solid ${avatarColors[i % avatarColors.length]}44`
              }}>
                {initials(m.name)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {m.name}
                  {m.id === user?.id && <span style={{ fontSize: '0.7rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '1px 6px', borderRadius: 4, fontWeight: 500 }}>Aap</span>}
                  {m.role === 'admin' && <span style={{ fontSize: '0.7rem', background: '#fef9c3', color: '#a16207', padding: '1px 6px', borderRadius: 4, fontWeight: 500 }}>Admin</span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.email}</div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Member since {new Date(m.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAdd && (
        <AddMemberModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); fetchMembers(); }}
        />
      )}
    </div>
  );
}
