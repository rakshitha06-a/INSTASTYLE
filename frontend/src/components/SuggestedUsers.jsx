import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const SuggestedUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/suggested/list');
        setUsers(res.data);
      } catch (err) { /* ignore */ }
    };
    fetchSuggested();
  }, []);

  const handleFollow = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/follow`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      console.error('Error following', err);
    }
  };

  if (users.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel" 
      style={{ padding: '20px', marginBottom: '24px' }}
    >
      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: 'var(--text-secondary)' }}>Suggested for you</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {users.map(u => (
          <div key={u._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to={`/profile/${u._id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
              <div className="avatar" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', fontSize: '0.85rem' }}>
                {u.profilePic 
                  ? <img src={`http://localhost:5000${u.profilePic}`} alt="avatar" />
                  : u.username.charAt(0).toUpperCase()
                }
              </div>
              <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{u.username}</span>
            </Link>
            <button onClick={() => handleFollow(u._id)} style={{ background: 'transparent', color: 'var(--accent-color)', fontWeight: '600', fontSize: '0.85rem', padding: '4px 8px' }}>
              Follow
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SuggestedUsers;
