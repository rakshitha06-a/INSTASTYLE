import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, Mail, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/notifications');
        setNotifications(res.data);
        await axios.put('http://localhost:5000/api/notifications/read-all');
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();

    // Poll for new notifications every 10s
    const interval = setInterval(async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/notifications');
        setNotifications(res.data);
      } catch (err) { /* ignore */ }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <Heart size={18} color="#ef4444" fill="#ef4444" />;
      case 'comment': return <MessageCircle size={18} color="#3b82f6" />;
      case 'follow': return <UserPlus size={18} color="#22c55e" />;
      case 'message': return <Mail size={18} color="#8b5cf6" />;
      default: return <Bell size={18} />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'like': return 'rgba(239, 68, 68, 0.15)';
      case 'comment': return 'rgba(59, 130, 246, 0.15)';
      case 'follow': return 'rgba(34, 197, 94, 0.15)';
      case 'message': return 'rgba(139, 92, 246, 0.15)';
      default: return 'rgba(139, 92, 246, 0.1)';
    }
  };

  const getLink = (notif) => {
    switch (notif.type) {
      case 'like':
      case 'comment':
        return '/';
      case 'follow':
        return `/profile/${notif.sender?._id}`;
      case 'message':
        return `/messages/${notif.sender?._id}`;
      default:
        return '/';
    }
  };

  const formatTime = (dateString) => {
    const diff = Date.now() - new Date(dateString);
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return 'Just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getActionText = (notif) => {
    switch (notif.type) {
      case 'like': return 'liked your post';
      case 'comment': return 'commented on your post';
      case 'follow': return 'started following you';
      case 'message': return 'sent you a message';
      default: return notif.text;
    }
  };

  return (
    <div style={{ minHeight: '70vh', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Notifications</h1>
        {notifications.length > 0 && (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {notifications.filter(n => !n.read).length} new
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}><div className="loader"></div></div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Bell size={36} color="var(--text-secondary)" />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No notifications yet</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>When someone interacts with your posts, you'll see it here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {notifications.map((notif, idx) => (
            <Link key={notif._id || idx} to={getLink(notif)} style={{ textDecoration: 'none', color: 'inherit' }}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  borderRadius: '12px',
                  background: notif.read ? 'transparent' : 'rgba(139, 92, 246, 0.05)',
                  border: notif.read ? '1px solid transparent' : '1px solid rgba(139, 92, 246, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                {/* Sender Avatar */}
                <div className="avatar" style={{
                  width: '44px', height: '44px',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  fontSize: '1rem', flexShrink: 0
                }}>
                  {notif.sender?.profilePic
                    ? <img src={`http://localhost:5000${notif.sender.profilePic}`} alt="avatar" />
                    : (notif.sender?.username?.charAt(0)?.toUpperCase() || '?')
                  }
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                    <span style={{ fontWeight: '600' }}>{notif.sender?.username || 'Someone'}</span>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{getActionText(notif)}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {formatTime(notif.createdAt)}
                  </div>
                </div>

                {/* Action Icon */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: getIconBg(notif.type),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {getIcon(notif.type)}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
