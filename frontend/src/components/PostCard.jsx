import { useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Edit3, Bookmark, MoreHorizontal, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const REACTIONS = ['❤️', '🔥', '😂', '😮', '😢', '👏'];

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [reactions, setReactions] = useState(post.reactions || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [doubleTapHeart, setDoubleTapHeart] = useState(false);
  const lastTapRef = useRef(0);

  const isLiked = user && likes.includes(user.id);
  const isOwner = user && post.user && post.user._id === user.id;

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) handleLike();
      setDoubleTapHeart(true);
      setTimeout(() => setDoubleTapHeart(false), 800);
    }
    lastTapRef.current = now;
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/${post._id}/like`);
      setLikes(res.data);
    } catch (err) {
      console.error('Error liking post', err);
    }
  };

  const handleReaction = async (type) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/${post._id}/react`, { type });
      setReactions(res.data);
      setShowReactions(false);
    } catch (err) {
      console.error('Error reacting', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${post._id}/comment`, { text: commentText });
      setComments(res.data);
      setCommentText('');
    } catch (err) {
      console.error('Error commenting', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/posts/${post._id}`);
      if (onDelete) onDelete(post._id);
    } catch (err) {
      console.error('Error deleting post', err);
    }
    setShowMenu(false);
  };

  const handleEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/posts/${post._id}`, { content: editContent });
      post.content = editContent;
      setIsEditing(false);
    } catch (err) {
      console.error('Error editing post', err);
    }
  };

  const handleBookmark = async () => {
    try {
      await axios.put(`http://localhost:5000/api/posts/${post._id}/bookmark`);
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      console.error('Error bookmarking', err);
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Group reactions by type
  const reactionCounts = {};
  reactions.forEach(r => {
    reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel" 
      style={{ marginBottom: '24px', overflow: 'hidden' }}
    >
      {/* Post Header */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to={`/profile/${post.user._id}`} style={{ textDecoration: 'none' }}>
            <div className="avatar" style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
              {post.user.profilePic
                ? <img src={`http://localhost:5000${post.user.profilePic}`} alt="avatar" />
                : post.user.username.charAt(0).toUpperCase()
              }
            </div>
          </Link>
          <div>
            <Link to={`/profile/${post.user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{post.user.username}</h3>
            </Link>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatDate(post.createdAt)}</span>
          </div>
        </div>
        
        {/* Menu */}
        {isOwner && (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(!showMenu)} className="btn-icon"><MoreHorizontal size={20} /></button>
            {showMenu && (
              <div className="glass-panel" style={{ position: 'absolute', right: 0, top: '100%', padding: '8px', minWidth: '140px', zIndex: 10 }}>
                <button onClick={() => { setIsEditing(true); setShowMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', width: '100%', background: 'transparent', color: 'var(--text-primary)', borderRadius: '8px', fontSize: '0.9rem' }}>
                  <Edit3 size={16} /> Edit
                </button>
                <button onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', width: '100%', background: 'transparent', color: 'var(--error-color)', borderRadius: '8px', fontSize: '0.9rem' }}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div style={{ padding: '0 16px 16px 16px' }}>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input className="glass-input" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
            <button onClick={handleEdit} className="btn-icon" style={{ color: 'var(--success-color)' }}><Check size={20} /></button>
            <button onClick={() => setIsEditing(false)} className="btn-icon" style={{ color: 'var(--error-color)' }}><X size={20} /></button>
          </div>
        ) : (
          <p style={{ margin: 0, lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{post.content}</p>
        )}
      </div>

      {/* Post Image (double-tap to like) */}
      {post.imageUrl && (
        <div style={{ width: '100%', maxHeight: '500px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.2)', position: 'relative', cursor: 'pointer' }} onClick={handleDoubleTap}>
          <img src={`http://localhost:5000${post.imageUrl}`} alt="Post content" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          {doubleTapHeart && <span className="double-tap-heart">❤️</span>}
        </div>
      )}

      {/* Reactions Display */}
      {Object.keys(reactionCounts).length > 0 && (
        <div style={{ padding: '8px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(reactionCounts).map(([type, count]) => (
            <span key={type} style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem' }}>
              {type} {count}
            </span>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={handleLike} className={isLiked ? 'heart-animation' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: isLiked ? '#ef4444' : 'var(--text-secondary)', padding: '4px' }}>
            <Heart size={20} fill={isLiked ? '#ef4444' : 'none'} />
            <span>{likes.length}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: 'var(--text-secondary)', padding: '4px' }}>
            <MessageCircle size={20} />
            <span>{comments.length}</span>
          </button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowReactions(!showReactions)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: 'var(--text-secondary)', padding: '4px', fontSize: '1.1rem' }}>
              😊
            </button>
            {showReactions && (
              <div className="glass-panel" style={{ position: 'absolute', bottom: '100%', left: 0, display: 'flex', gap: '4px', padding: '6px 10px', zIndex: 10 }}>
                {REACTIONS.map(r => (
                  <button key={r} onClick={() => handleReaction(r)} style={{ background: 'transparent', fontSize: '1.3rem', padding: '4px', borderRadius: '4px' }}>
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button onClick={handleBookmark} style={{ background: 'transparent', color: isBookmarked ? 'var(--accent-color)' : 'var(--text-secondary)', padding: '4px' }}>
          <Bookmark size={20} fill={isBookmarked ? 'var(--accent-color)' : 'none'} />
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', background: 'var(--bg-surface)' }}
          >
            <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
              {comments.map((c, idx) => (
                <div key={idx} style={{ marginBottom: '12px', display: 'flex', gap: '10px' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{c.user?.username || 'User'}:</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{c.text}</div>
                </div>
              ))}
              
              <form onSubmit={handleComment} style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <input type="text" className="glass-input" placeholder="Add a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} style={{ padding: '8px 12px' }} />
                <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>Post</button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
