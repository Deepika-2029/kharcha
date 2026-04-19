import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Plus } from 'lucide-react';
import { format } from 'date-fns';
import AddTransactionModal from '../components/AddTransactionModal';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dashboard/summary?month=${month}&year=${year}`);
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [month, year]);

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      Loading...
    </div>
  );

  const budgetUsed = data?.monthlyBudget > 0 ? Math.min((data.expense / data.monthlyBudget) * 100, 100) : 0;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Namaste, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Aapka financial summary</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select className="form-select" style={{ width: 'auto' }} value={month} onChange={e => setMonth(+e.target.value)}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={year} onChange={e => setYear(+e.target.value)}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Kharcha Jodo
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <TrendingUp size={14} color="var(--success)" /> Aaya (Income)
          </div>
          <div className="stat-value income">{fmt(data?.income || 0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <TrendingDown size={14} color="var(--danger)" /> Gaya (Expense)
          </div>
          <div className="stat-value expense">{fmt(data?.expense || 0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Wallet size={14} color="var(--primary)" /> Bacha (Balance)
          </div>
          <div className="stat-value" style={{ color: data?.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {fmt(data?.balance || 0)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <PiggyBank size={14} color="var(--warning)" /> Monthly Budget
          </div>
          <div className="stat-value">{fmt(data?.monthlyBudget || 0)}</div>
          {data?.monthlyBudget > 0 && (
            <>
              <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                <div className="progress-fill" style={{
                  width: `${budgetUsed}%`,
                  background: budgetUsed > 90 ? 'var(--danger)' : budgetUsed > 70 ? 'var(--warning)' : 'var(--success)'
                }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {budgetUsed.toFixed(0)}% used
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Bar chart - 6 months trend */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">6 Mahine ka Trend</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.trend || []} barGap={4}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => fmt(v)} />
              <Legend />
              <Bar dataKey="income" name="Aaya" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="expense" name="Gaya" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart - by category */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Category wise Kharcha</span>
          </div>
          {data?.byCategory?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.byCategory} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {data.byCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={v => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p>Koi kharcha nahi is mahine</p>
            </div>
          )}
        </div>
      </div>

      {/* Category budget limits */}
      {data?.byCategory?.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <span className="card-title">Category Budget Status</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {data.byCategory.map((cat, i) => {
              const pct = cat.budgetLimit > 0 ? Math.min((cat.amount / cat.budgetLimit) * 100, 100) : 0;
              const over = cat.budgetLimit > 0 && cat.amount > cat.budgetLimit;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{cat.name}</span>
                    <span style={{ fontSize: '0.875rem', color: over ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {fmt(cat.amount)} {cat.budgetLimit > 0 && `/ ${fmt(cat.budgetLimit)}`}
                      {over && ' ⚠️ Over!'}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${pct}%`,
                      background: over ? 'var(--danger)' : pct > 75 ? 'var(--warning)' : cat.color
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Transactions</span>
        </div>
        {data?.recentTransactions?.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Note</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{format(new Date(tx.date), 'dd MMM')}</td>
                    <td>{tx.note || '—'}</td>
                    <td>
                      {tx.category ? (
                        <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '999px', background: tx.category.color + '22', color: tx.category.color, fontWeight: 500 }}>
                          {tx.category.icon} {tx.category.name}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">💸</div>
            <p>Is mahine koi transaction nahi</p>
          </div>
        )}
      </div>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); fetchData(); }} />}
    </div>
  );
}
