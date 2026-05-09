import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="glass-panel" 
        style={{ width: '100%', maxWidth: '420px', padding: '40px 36px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <img src="/logo.png" alt="InstaStyle" style={{ width: '56px', height: '56px', borderRadius: '14px', boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)' }} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '6px' }}>Join InstaStyle</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Create an account to connect</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '12px 16px', backgroundColor: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '10px', color: 'var(--error-color)', marginBottom: '24px', textAlign: 'center', fontSize: '0.9rem' }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.02em' }}>USERNAME</label>
            <input 
              type="text" className="glass-input" required 
              placeholder="yourname"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.02em' }}>EMAIL</label>
            <input 
              type="email" className="glass-input" required 
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.02em' }}>PASSWORD</label>
            <input 
              type="password" className="glass-input" required 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px', padding: '14px', fontSize: '1rem', borderRadius: '10px' }}>
            {loading ? <div className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Already have an account? </span>
          <Link to="/login" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
