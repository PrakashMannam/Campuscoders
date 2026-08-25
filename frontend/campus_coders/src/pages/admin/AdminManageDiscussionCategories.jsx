import React, { useCallback, useEffect, useState } from 'react';
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
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
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

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      showToast('error', 'Name and Slug are required.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/discussion-categories/${editingId}`, form);
        showToast('success', 'Category updated successfully.');
      } else {
        await api.post('/admin/discussion-categories', form);
        showToast('success', 'Category created successfully.');
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      color: cat.color || '#3B82F6',
      iconName: cat.iconName || 'message-square',
      sortOrder: cat.sortOrder || 0,
    });
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      if (currentActive) {
        await api.patch(`/admin/discussion-categories/${id}/deactivate`);
        showToast('success', 'Category deactivated.');
      } else {
        await api.patch(`/admin/discussion-categories/${id}/activate`);
        showToast('success', 'Category activated.');
      }
      load();
    } catch (err) {
      showToast('error', 'Failed to toggle status.');
    }
  };

  return (
    <div className="admin-page">
      {toast.show && <Toast type={toast.type} message={toast.message} onClose={hideToast} />}
      
      <div className="admin-header">
        <h2>Discussion Categories</h2>
        <p>Manage categories for the community discussions.</p>
      </div>

      <div className="admin-content-grid">
        {/* Form Section */}
        <div className="admin-form-card">
          <h3>{editingId ? 'Edit Category' : 'Add New Category'}</h3>
          
          <div className="admin-form-group">
            <label>Name</label>
            <input 
              value={form.name} 
              onChange={(e) => {
                const val = e.target.value;
                setForm({ ...form, name: val, slug: editingId ? form.slug : slugify(val) });
              }} 
              placeholder="e.g. Study Guides & Resources"
            />
          </div>

          <div className="admin-form-group">
            <label>Slug</label>
            <input 
              value={form.slug} 
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} 
              placeholder="e.g. study-guides"
            />
          </div>

          <div className="admin-form-group">
            <label>Description</label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              rows={3}
            />
          </div>

          <div className="admin-form-group">
            <label>Hex Color</label>
            <input 
              type="text"
              value={form.color} 
              onChange={(e) => setForm({ ...form, color: e.target.value })} 
              placeholder="e.g. #3B82F6"
            />
          </div>

          <div className="admin-form-group">
            <label>Icon Name</label>
            <input 
              type="text"
              value={form.iconName} 
              onChange={(e) => setForm({ ...form, iconName: e.target.value })} 
              placeholder="e.g. book-open"
            />
          </div>

          <div className="admin-form-group">
            <label>Sort Order</label>
            <input 
              type="number"
              value={form.sortOrder} 
              onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} 
            />
          </div>

          <div className="admin-form-actions">
            {editingId && (
              <button 
                type="button" 
                className="admin-btn-cancel" 
                onClick={() => { setForm(emptyForm); setEditingId(null); }}
              >
                Cancel
              </button>
            )}
            <button 
              type="button" 
              className="admin-btn-primary" 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? 'Saving...' : editingId ? 'Update Category' : 'Add Category'}
            </button>
          </div>
        </div>

        {/* List Section */}
        <div className="admin-list-card">
          <h3>Existing Categories</h3>
          {loading ? (
            <p className="admin-loading">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="admin-empty">No categories found.</p>
          ) : (
            <ul className="admin-item-list">
              {categories.map((cat) => (
                <li key={cat.id} className={`admin-item-row ${cat.active ? '' : 'inactive'}`}>
                  <div className="admin-item-info">
                    <span className="admin-item-title" style={{ color: cat.color }}>{cat.name}</span>
                    <span className="admin-item-sub">/{cat.slug} • Order: {cat.sortOrder}</span>
                    {!cat.active && <span className="admin-badge disabled">Inactive</span>}
                  </div>
                  <div className="admin-item-actions">
                    <button onClick={() => handleEdit(cat)}>Edit</button>
                    <button 
                      className={cat.active ? 'admin-btn-danger' : 'admin-btn-success'}
                      onClick={() => handleToggleActive(cat.id, cat.active)}
                    >
                      {cat.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
