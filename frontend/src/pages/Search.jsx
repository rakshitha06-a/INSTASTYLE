import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/users/search/${query}`);
      setResults(res.data);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', minHeight: '70vh' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '24px' }}>Search Users</h1>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <SearchIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            className="glass-input"
            placeholder="Search by username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '42px' }}
          />
        </div>
        <button type="submit" className="btn-primary" style={{ borderRadius: '8px', padding: '12px 20px' }}>
          Search
        </button>
      </form>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <div className="loader"></div>
        </div>
      ) : searched && results.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)' }}>
          <p>No users found for "{query}"</p>
        </div>
      ) : (
        <AnimatePresence>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {results.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-panel"
                style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Link to={`/profile/${user._id}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', color: 'inherit', flex: 1 }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', color: 'white', fontSize: '1.2rem', flexShrink: 0
                  }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600' }}>{user.username}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {user.followers?.length || 0} followers
                    </div>
                  </div>
                </Link>
                <Link 
                  to={`/profile/${user._id}`} 
                  className="btn-primary" 
                  style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                >
                  <UserPlus size={16} /> View
                </Link>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Search;
