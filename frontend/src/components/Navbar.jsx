import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Search, Bell, MessageCircle, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/notifications/unread-count');
        setUnreadCount(res.data.count);
      } catch (err) { /* ignore */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 100,
      padding: scrolled ? '8px 0' : '14px 0',
      background: scrolled ? 'var(--bg-glass)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px) saturate(150%)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{ 
          fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', 
          display: 'flex', alignItems: 'center', gap: '10px',
          letterSpacing: '-0.03em'
        }}>
          <img src="/logo.png" alt="InstaStyle" style={{ 
            width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover',
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)'
          }} />
          <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            InstaStyle
          </span>
        </Link>
        
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {user ? (
            <>
              <Link to="/" className="btn-icon" title="Feed"><Home size={20} /></Link>
              <Link to="/search" className="btn-icon" title="Search"><Search size={20} /></Link>
              <Link to="/messages" className="btn-icon" title="Messages"><MessageCircle size={20} /></Link>
              <Link to="/notifications" className="btn-icon" title="Notifications" style={{ position: 'relative' }}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </Link>
              <button onClick={toggleTheme} className="btn-icon" title="Toggle Theme">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link to={`/profile/${user.id}`} title="My Profile" style={{ marginLeft: '4px' }}>
                <div className="avatar" style={{ 
                  width: '34px', height: '34px', 
                  background: 'var(--accent-gradient)', 
                  fontSize: '0.85rem',
                  border: '2px solid var(--border-color)',
                  boxShadow: '0 0 0 2px var(--bg-primary)'
                }}>
                  {user.profilePic 
                    ? <img src={`http://localhost:5000${user.profilePic}`} alt="avatar" />
                    : user.username.charAt(0).toUpperCase()
                  }
                </div>
              </Link>
              <button onClick={handleLogout} className="btn-icon" title="Logout"><LogOut size={20} /></button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text-secondary)', fontWeight: 500, padding: '8px 16px' }}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem', borderRadius: '20px' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
