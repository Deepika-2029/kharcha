import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Target } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

function GoalModal({ goal, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: goal?.title || '',
    targetAmount: goal?.targetAmount || '',
    savedAmount: goal?.savedAmount || 0,
    deadline: goal?.deadline ? format(new Date(goal.deadline), 'yyyy-MM-dd') : '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (goal) {
        await api.put(`/goals/${goal.id}`, form);
        toast.success('Goal update ho gaya!');
      } else {
        await api.post('/goals', form);
        toast.success('Naya goal set ho gaya! 🎯');
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
          <span>{goal ? 'Goal Edit Karo' : 'Naya Savings Goal'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Goal ka Naam</label>
            <input className="form-input" placeholder="e.g. Naya Phone, Car, Vacation" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Target Amount (₹)</label>
              <input className="form-input" type="number" placeholder="25000" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} required min="1" />
            </div>
            <div className="form-group">
              <label className="form-label">Abhi tak Bacha (₹)</label>
              <input className="form-input" type="number" placeholder="0" value={form.savedAmount} onChange={e => setForm({ ...form, savedAmount: e.target.value })} min="0" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Deadline (optional)</label>
            <input className="form-input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Save...' : goal ? 'Update Karo' : 'Goal Set Karo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);

  const fetchGoals = async () => {
    const res = await api.get('/goals');
    setGoals(res.data);
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete karna chahte ho?')) return;
    await api.delete(`/goals/${id}`);
    toast.success('Delete ho gaya');
    fetchGoals();
  };

  const goalColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Sapne poore karo — ek kadam ek baar</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Naya Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Target size={48} color="var(--text-muted)" /></div>
            <p style={{ marginBottom: '1rem' }}>Koi savings goal nahi hai abhi</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Pehla Goal Set Karo
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {goals.map((goal, i) => {
            const color = goalColors[i % goalColors.length];
            const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
            const remaining = goal.targetAmount - goal.savedAmount;
            const daysLeft = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;
            const done = pct >= 100;

            return (
              <div key={goal.id} className="card" style={{ border: done ? `2px solid ${color}` : '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      {done && <span style={{ fontSize: '1.1rem' }}>🎉</span>}
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{goal.title}</h3>
                    </div>
                    {goal.deadline && (
                      <div style={{ fontSize: '0.75rem', color: daysLeft !== null && daysLeft < 30 ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {daysLeft !== null && daysLeft >= 0 ? `${daysLeft} din baaki` : daysLeft !== null ? 'Deadline nikal gayi!' : ''}
                        {goal.deadline && ` · ${format(new Date(goal.deadline), 'dd MMM yyyy')}`}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setEditGoal(goal)}>
                      <Pencil size={12} />
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(goal.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Progress circle-ish */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Bacha hua</span>
                  <span style={{ fontWeight: 700, color }}>{pct.toFixed(0)}% complete</span>
                </div>
                <div className="progress-bar" style={{ height: 12, marginBottom: '0.875rem' }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Bacha</div>
                    <div style={{ fontWeight: 700, color: 'var(--success)' }}>{fmt(goal.savedAmount)}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Baaki</div>
                    <div style={{ fontWeight: 700, color: 'var(--danger)' }}>{fmt(Math.max(0, remaining))}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Target</div>
                    <div style={{ fontWeight: 700 }}>{fmt(goal.targetAmount)}</div>
                  </div>
                </div>

                {done && (
                  <div style={{ marginTop: '0.875rem', padding: '0.5rem', background: color + '22', borderRadius: 8, textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color }}>
                    🎉 Goal Poora Ho Gaya! Mubarak ho!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {(showModal || editGoal) && (
        <GoalModal
          goal={editGoal}
          onClose={() => { setShowModal(false); setEditGoal(null); }}
          onSuccess={() => { setShowModal(false); setEditGoal(null); fetchGoals(); }}
        />
      )}
    </div>
  );
}
