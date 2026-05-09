import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import SuggestedUsers from '../components/SuggestedUsers';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/posts');
        setPosts(res.data);
      } catch (err) {
        console.error('Failed to fetch posts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  return (
    <div style={{ position: 'relative', minHeight: '80vh' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>Your Feed</h1>
      </div>

      <SuggestedUsers />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-panel" style={{ padding: '20px', animation: `pulse 1.5s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
                <div>
                  <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '6px' }}></div>
                  <div className="skeleton" style={{ width: '80px', height: '10px' }}></div>
                </div>
              </div>
              <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: '12px' }}></div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📷</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 500 }}>No posts yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Be the first to share something!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {posts.map(post => (
            <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="btn-primary"
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px var(--accent-glow)',
          zIndex: 90
        }}
        title="Create Post"
      >
        <Plus size={26} />
      </button>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPostCreated={handlePostCreated} 
      />
    </div>
  );
};

export default Feed;
