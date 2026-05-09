import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MessageCircle, X } from 'lucide-react';

const FollowListModal = ({ isOpen, onClose, title, users }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000, padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel"
          style={{ width: '100%', maxWidth: '400px', maxHeight: '70vh', backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{title}</h2>
            <button onClick={onClose} className="btn-icon"><X size={20} /></button>
          </div>

          {/* User List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                {title === 'Followers' ? 'No followers yet' : 'Not following anyone yet'}
              </div>
            ) : (
              users.map((u, idx) => (
                <Link
                  key={u._id || idx}
                  to={`/profile/${u._id}`}
                  onClick={onClose}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <div className="avatar" style={{
                      width: '44px', height: '44px',
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                      fontSize: '1rem'
                    }}>
                      {u.profilePic
                        ? <img src={`http://localhost:5000${u.profilePic}`} alt="avatar" />
                        : (u.username?.charAt(0)?.toUpperCase() || '?')
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{u.username}</div>
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${id}`);
        setProfileUser(res.data.user);
        setPosts(res.data.posts);

        if (currentUser) {
          const following = res.data.user.followers.some(follower => follower._id === currentUser.id);
          setIsFollowing(following);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    try {
      await axios.put(`http://localhost:5000/api/users/${id}/follow`);
      setIsFollowing(!isFollowing);

      setProfileUser(prev => ({
        ...prev,
        followers: isFollowing
          ? prev.followers.filter(f => f._id !== currentUser.id)
          : [...prev.followers, { _id: currentUser.id, username: currentUser.username, profilePic: currentUser.profilePic || '' }]
      }));
    } catch (err) {
      console.error('Error toggling follow', err);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const res = await axios.put('http://localhost:5000/api/users/profile-pic/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileUser(prev => ({ ...prev, profilePic: res.data.profilePic }));
      updateUser({ ...currentUser, profilePic: res.data.profilePic });
    } catch (err) {
      console.error('Error uploading profile pic', err);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}><div className="loader"></div></div>;
  if (!profileUser) return <div style={{ textAlign: 'center', marginTop: '40px' }}>User not found</div>;

  const isOwnProfile = currentUser && currentUser.id === profileUser._id;

  return (
    <div style={{ paddingBottom: '40px', maxWidth: '600px', margin: '0 auto' }}>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          {/* Avatar with upload */}
          <div style={{ position: 'relative', marginRight: '24px', flexShrink: 0 }}>
            <div className="avatar" style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', fontSize: '2rem' }}>
              {profileUser.profilePic
                ? <img src={`http://localhost:5000${profileUser.profilePic}`} alt="avatar" />
                : profileUser.username.charAt(0).toUpperCase()
              }
            </div>
            {isOwnProfile && (
              <label style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--accent-color)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                border: '2px solid var(--bg-color)'
              }}>
                <Camera size={14} color="white" />
                <input type="file" accept="image/*" onChange={handleProfilePicUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Stats Row — clickable followers/following */}
          <div style={{ display: 'flex', justifyContent: 'space-around', flex: 1, color: 'var(--text-primary)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{posts.length}</div>
              <div style={{ fontSize: '0.85rem' }}>posts</div>
            </div>
            <div
              style={{ textAlign: 'center', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onClick={() => setShowFollowers(true)}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{profileUser.followers?.length || 0}</div>
              <div style={{ fontSize: '0.85rem' }}>followers</div>
            </div>
            <div
              style={{ textAlign: 'center', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onClick={() => setShowFollowing(true)}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{profileUser.following?.length || 0}</div>
              <div style={{ fontSize: '0.85rem' }}>following</div>
            </div>
          </div>
        </div>

        {/* Username */}
        <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '12px' }}>{profileUser.username}</div>

        {/* Follow & Message Buttons */}
        {!isOwnProfile && currentUser && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleFollowToggle}
              style={{
                flex: 1, padding: '8px', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', border: 'none',
                backgroundColor: isFollowing ? 'rgba(255,255,255,0.1)' : 'var(--accent-color)',
                color: isFollowing ? 'var(--text-primary)' : 'white', cursor: 'pointer'
              }}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <Link
              to={`/messages/${profileUser._id}`}
              style={{
                flex: 1, padding: '8px', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem',
                backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none'
              }}
            >
              <MessageCircle size={16} /> Message
            </Link>
          </div>
        )}
      </motion.div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)' }}>No posts yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
          {posts.map(post => (
            <div key={post._id} style={{ aspectRatio: '1/1', backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
              {post.imageUrl ? (
                <img src={`http://localhost:5000${post.imageUrl}`} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', wordBreak: 'break-word' }}>
                  {post.content && post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Followers Modal */}
      <FollowListModal
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
        title="Followers"
        users={profileUser.followers || []}
      />

      {/* Following Modal */}
      <FollowListModal
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
        title="Following"
        users={profileUser.following || []}
      />
    </div>
  );
};

export default Profile;
