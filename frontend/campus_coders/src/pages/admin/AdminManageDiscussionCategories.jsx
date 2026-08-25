import React, { useCallback, useEffect, useState } from 'react';
import { FiEdit3, FiPlus, FiX, FiEyeOff, FiEye } from 'react-icons/fi';
import Toast from '../../components/Toast';
import api from '../../api/client';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  color: '#3B82F6',
  iconName: 'message-square',
  sortOrder: 0,
};

export default function AdminManageDiscussionCategories() {
  const [categories, setCategories] = useState([]);
  const [formModal, setFormModal] = useState({ isOpen: false, isEdit: false, id: null });
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast((prev) => ({ ...prev, show: false })), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/discussion-categories');
      setCategories(res.data || []);
    } catch (err) {
      showToast('error', 'Failed to load discussion categories.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const openAddModal = () => {
    setForm(emptyForm);
    setFormModal({ isOpen: true, isEdit: false, id: null });
  };

  const openEditModal = (cat) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      color: cat.color || '#3B82F6',
      iconName: cat.iconName || 'message-square',
      sortOrder: cat.sortOrder || 0,
    });
    setFormModal({ isOpen: true, isEdit: true, id: cat.id });
  };

  const closeModal = () => {
    setFormModal({ isOpen: false, isEdit: false, id: null });
    setForm(emptyForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      showToast('error', 'Name and Slug are required.');
      return;
    }
    setSaving(true);
    try {
      if (formModal.isEdit) {
        await api.put(`/admin/discussion-categories/${formModal.id}`, form);
        showToast('success', 'Category updated successfully.');
      } else {
        await api.post('/admin/discussion-categories', form);
        showToast('success', 'Category created successfully.');
      }
      closeModal();
      load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      if (currentActive) {
        await api.patch(`/admin/discussion-categories/${id}/deactivate`);
        showToast('success', 'Category hidden from students.');
      } else {
        await api.patch(`/admin/discussion-categories/${id}/activate`);
        showToast('success', 'Category is now live.');
      }
      load();
    } catch (err) {
      showToast('error', 'Failed to toggle status.');
    }
  };

  return (
    <div className="admin-page" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {toast.show && <Toast type={toast.type} message={toast.message} onClose={hideToast} />}
      
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Discussion Categories</h2>
          <p>Manage the categories students use in Community discussions.</p>
        </div>
        <button className="disc-btn-submit" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiPlus /> New Category
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {loading ? (
          <p className="admin-loading">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="admin-empty">No categories found. Create one to get started.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'var(--card-bg, #fff)',
                  border: '1px solid var(--line, #e5e7eb)',
                  borderRadius: '12px',
                  opacity: cat.active ? 1 : 0.6,
                  transition: 'all 0.2s'
                }}
              >
                {/* Left Side: Student Preview styling */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Sidebar Preview
                    </div>
                    {/* The exact Community Sidebar layout */}
                    <div className="disc-cat-item" style={{ width: 'fit-content', padding: '6px 12px', background: 'var(--paper)', border: '1px solid var(--line)' }}>
                      <span className="disc-cat-dot" style={{ background: cat.color || 'var(--gold)' }} />
                      <span className="disc-cat-name">{cat.name}</span>
                    </div>
                  </div>

                  <div style={{ width: '1px', height: '40px', background: 'var(--line)' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Thread Chip Preview
                    </div>
                    {/* The exact Community Thread chip layout */}
                    <span 
                      className="disc-thread-cat" 
                      style={{ 
                        background: `${cat.color || '#C5A028'}22`, 
                        color: cat.color || '#7A6410',
                        width: 'fit-content'
                      }}
                    >
                      {cat.name}
                    </span>
                  </div>
                </div>

                {/* Right Side: Admin Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                    <div>/{cat.slug}</div>
                    <div>Order: {cat.sortOrder}</div>
                  </div>
                  
                  <button 
                    onClick={() => handleToggleActive(cat.id, cat.active)}
                    title={cat.active ? "Hide from students" : "Show to students"}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: cat.active ? 'var(--ink-muted)' : '#EF4444',
                      padding: '8px', borderRadius: '50%'
                    }}
                  >
                    {cat.active ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                  </button>

                  <button 
                    onClick={() => openEditModal(cat)}
                    className="disc-btn-submit"
                    style={{ padding: '6px 12px', background: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--line)' }}
                  >
                    <FiEdit3 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reusing the Community Modal Styling */}
      {formModal.isOpen && (
        <div className="disc-modal-overlay" onClick={closeModal}>
          <div className="disc-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="disc-modal-header">
              <h3>{formModal.isEdit ? 'Edit Category' : 'New Category'}</h3>
              <button type="button" className="disc-modal-close" onClick={closeModal}>
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="disc-modal-body">
              <div className="disc-form-group">
                <label>Category Name</label>
                <input 
                  value={form.name} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, name: val, slug: formModal.isEdit ? form.slug : slugify(val) });
                  }} 
                  required 
                  placeholder="e.g. Study Guides"
                />
              </div>

              <div className="disc-form-group">
                <label>URL Slug</label>
                <input 
                  value={form.slug} 
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} 
                  required 
                />
              </div>

              <div className="disc-form-group">
                <label>Description</label>
                <textarea 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  rows={2}
                  placeholder="Brief description for admins..."
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="disc-form-group" style={{ flex: 1 }}>
                  <label>Hex Color Accent</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="color"
                      value={form.color} 
                      onChange={(e) => setForm({ ...form, color: e.target.value })} 
                      style={{ width: '40px', height: '36px', padding: 0, cursor: 'pointer', border: 'none' }}
                    />
                    <input 
                      type="text"
                      value={form.color} 
                      onChange={(e) => setForm({ ...form, color: e.target.value })} 
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                <div className="disc-form-group" style={{ flex: 1 }}>
                  <label>Sort Order</label>
                  <input 
                    type="number"
                    value={form.sortOrder} 
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} 
                  />
                </div>
              </div>

              <div className="disc-modal-footer" style={{ marginTop: '24px' }}>
                <button type="button" className="disc-btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="disc-btn-submit" disabled={saving}>
                  {saving ? 'Saving...' : formModal.isEdit ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
