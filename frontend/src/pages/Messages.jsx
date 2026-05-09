import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft, Search, MessageCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Messages = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch conversations list
  useEffect(() => {
    if (!userId) {
      const fetchConversations = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/messages/conversations');
          setConversations(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
      };
      fetchConversations();
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // Fetch messages for a specific chat
  useEffect(() => {
    if (userId) {
      setLoading(true);
      const fetchMessages = async () => {
        try {
          const [msgRes, userRes] = await Promise.all([
            axios.get(`http://localhost:5000/api/messages/${userId}`),
            axios.get(`http://localhost:5000/api/users/${userId}`)
          ]);
          setMessages(msgRes.data);
          setChatUser(userRes.data.user);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
      };
      fetchMessages();

      // Poll for new messages every 2 seconds for real-time feel
      const interval = setInterval(async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/messages/${userId}`);
          setMessages(res.data);
        } catch (err) { /* ignore */ }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (userId && !loading) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [userId, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/messages/${userId}`, { text });
      setMessages(prev => [...prev, res.data]);
      setText('');
      inputRef.current?.focus();
    } catch (err) { console.error(err); }
  };

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/users/search/${query}`);
      setSearchResults(res.data.filter(u => u._id !== currentUser.id));
    } catch (err) { console.error(err); }
    finally { setSearchLoading(false); }
  };

  const startChat = (targetUserId) => {
    setShowNewChat(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/messages/${targetUserId}`);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    
    if (mins < 1) return 'Now';
    if (mins < 60) return `${mins}m`;
    
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = [];
    let currentDate = null;

    msgs.forEach(msg => {
      const msgDate = new Date(msg.createdAt).toLocaleDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ type: 'date', date: msgDate, dateObj: new Date(msg.createdAt) });
      }
      groups.push({ type: 'message', data: msg });
    });

    return groups;
  };

  const formatDateLabel = (dateObj) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateObj.toLocaleDateString() === today.toLocaleDateString()) return 'Today';
    if (dateObj.toLocaleDateString() === yesterday.toLocaleDateString()) return 'Yesterday';
    return dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // ===================== CHAT VIEW =====================
  if (userId) {
    const groupedMessages = groupMessagesByDate(messages);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: '600px', margin: '0 auto' }}>
        {/* Chat Header */}
        <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px', marginBottom: '12px' }}>
          <Link to="/messages" className="btn-icon"><ArrowLeft size={20} /></Link>
          {chatUser && (
            <Link to={`/profile/${chatUser._id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit', flex: 1 }}>
              <div className="avatar" style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', fontSize: '1rem' }}>
                {chatUser.profilePic
                  ? <img src={`http://localhost:5000${chatUser.profilePic}`} alt="avatar" />
                  : chatUser.username.charAt(0).toUpperCase()
                }
              </div>
              <div>
                <div style={{ fontWeight: '600' }}>{chatUser.username}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tap to view profile</div>
              </div>
            </Link>
          )}
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}><div className="loader"></div></div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '60px' }}>
              <div className="avatar" style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', fontSize: '1.5rem', margin: '0 auto 12px' }}>
                {chatUser?.username?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{chatUser?.username}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Send a message to start the conversation!</p>
            </div>
          ) : (
            groupedMessages.map((item, idx) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${idx}`} style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '4px 12px', borderRadius: '12px' }}>
                      {formatDateLabel(item.dateObj)}
                    </span>
                  </div>
                );
              }

              const msg = item.data;
              const isMine = msg.sender._id === currentUser.id || msg.sender === currentUser.id;

              return (
                <motion.div
                  key={msg._id || idx}
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '6px', padding: '0 8px' }}
                >
                  {/* Show avatar for other user */}
                  {!isMine && (
                    <div className="avatar" style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', fontSize: '0.7rem', marginRight: '8px', marginTop: 'auto', marginBottom: '4px' }}>
                      {chatUser?.profilePic
                        ? <img src={`http://localhost:5000${chatUser.profilePic}`} alt="avatar" />
                        : chatUser?.username?.charAt(0)?.toUpperCase()
                      }
                    </div>
                  )}
                  <div style={{
                    maxWidth: '70%',
                    padding: '10px 14px',
                    borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMine ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'var(--bg-glass)',
                    color: isMine ? 'white' : 'var(--text-primary)',
                    fontSize: '0.95rem',
                    lineHeight: '1.4',
                    border: isMine ? 'none' : '1px solid var(--border-color)',
                    boxShadow: isMine ? '0 2px 8px rgba(139, 92, 246, 0.3)' : 'none'
                  }}>
                    {msg.text}
                    <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                      {formatMessageTime(msg.createdAt)}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', paddingTop: '12px' }}>
          <input 
            ref={inputRef}
            className="glass-input" 
            placeholder="Type a message..." 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            style={{ flex: 1, borderRadius: '24px', paddingLeft: '20px' }} 
          />
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={!text.trim()}
            style={{ 
              borderRadius: '50%', width: '48px', height: '48px', padding: 0, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: text.trim() ? 1 : 0.5
            }}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    );
  }

  // ===================== CONVERSATIONS LIST VIEW =====================
  return (
    <div style={{ minHeight: '70vh', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Messages</h1>
        <button onClick={() => setShowNewChat(true)} className="btn-icon" title="New Chat" style={{ background: 'var(--accent-color)', color: 'white', width: '36px', height: '36px' }}>
          <Plus size={20} />
        </button>
      </div>

      {/* New Chat Search Modal */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
              display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
              paddingTop: '100px', zIndex: 1000
            }}
            onClick={() => setShowNewChat(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel"
              style={{ width: '100%', maxWidth: '440px', padding: '24px', backgroundColor: 'var(--bg-color)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px' }}>New Message</h2>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  className="glass-input"
                  placeholder="Search for a user..."
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  style={{ paddingLeft: '42px' }}
                  autoFocus
                />
              </div>
              
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {searchLoading ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}><div className="loader"></div></div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(u => (
                    <div
                      key={u._id}
                      onClick={() => startChat(u._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div className="avatar" style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', fontSize: '0.95rem' }}>
                        {u.profilePic
                          ? <img src={`http://localhost:5000${u.profilePic}`} alt="avatar" />
                          : u.username.charAt(0).toUpperCase()
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{u.username}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.followers?.length || 0} followers</div>
                      </div>
                    </div>
                  ))
                ) : searchQuery.trim() ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '16px' }}>No users found</p>
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '16px' }}>Type a username to search</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversations */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}><div className="loader"></div></div>
      ) : conversations.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MessageCircle size={36} color="var(--text-secondary)" />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No messages yet</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px', marginBottom: '20px' }}>Start a conversation with someone!</p>
          <button onClick={() => setShowNewChat(true)} className="btn-primary" style={{ padding: '10px 24px' }}>
            Start a Chat
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {conversations.map(conv => (
            <Link key={conv.user._id} to={`/messages/${conv.user._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <motion.div
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                style={{ 
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', 
                  cursor: 'pointer', borderRadius: '12px', transition: 'all 0.2s',
                  background: conv.unreadCount > 0 ? 'rgba(139, 92, 246, 0.05)' : 'transparent'
                }}
              >
                <div className="avatar" style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', fontSize: '1.2rem' }}>
                  {conv.user.profilePic
                    ? <img src={`http://localhost:5000${conv.user.profilePic}`} alt="avatar" />
                    : conv.user.username.charAt(0).toUpperCase()
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: conv.unreadCount > 0 ? '700' : '600' }}>{conv.user.username}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatTime(conv.lastMessageTime)}</span>
                  </div>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: conv.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)', 
                    fontWeight: conv.unreadCount > 0 ? '500' : '400',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px',
                    marginTop: '2px'
                  }}>
                    {conv.lastMessage}
                  </div>
                </div>
                {conv.unreadCount > 0 && (
                  <div style={{ 
                    background: 'var(--accent-color)', color: 'white', borderRadius: '50%', 
                    minWidth: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: '0.7rem', fontWeight: '700', padding: '0 6px'
                  }}>
                    {conv.unreadCount}
                  </div>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
