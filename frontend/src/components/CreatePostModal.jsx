import { useState } from 'react';
import axios from 'axios';
import { X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await axios.post('http://localhost:5000/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onPostCreated(res.data);
      setContent('');
      setImage(null);
      setImagePreview(null);
      onClose();
    } catch (err) {
      console.error('Failed to create post', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel"
            style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-color)' }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Create Post</h2>
              <button onClick={onClose} className="btn-icon"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              <textarea
                className="glass-input"
                placeholder="What's on your mind?"
                style={{ minHeight: '100px', resize: 'none', border: 'none', background: 'transparent', padding: '0', fontSize: '1.1rem' }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              
              {imagePreview && (
                <div style={{ position: 'relative', marginTop: '16px', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                  <button 
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(null); }}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px', borderRadius: '50%' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)' }}>
                  <ImageIcon size={20} />
                  <span>Add Image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
                
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading || (!content.trim() && !image)}
                  style={{ borderRadius: '20px', padding: '8px 24px' }}
                >
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
