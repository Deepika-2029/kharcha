import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Wallet } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', familyName: '' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password kam se kam 6 characters ka hona chahiye');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.familyName);
      toast.success('Account ban gaya! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Wallet size={28} />
          GharKharcha
        </div>
        <p className="auth-subtitle">Apna naya account banao</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Aapka Naam</label>
            <input className="form-input" placeholder="Rahul Sharma" value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Family ka Naam</label>
            <input className="form-input" placeholder="Sharma Family" value={form.familyName} onChange={set('familyName')} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="aapka@email.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Ban raha hai...' : 'Account Banao'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Pehle se account hai?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login Karen</Link>
        </div>
      </div>
    </div>
  );
}
