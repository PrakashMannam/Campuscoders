import React, { useMemo, useState, useCallback } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiBook, FiUsers, FiX, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import Toast from '../../components/Toast';
import {
  MOCK_PATHS, MOCK_TOPICS, MOCK_RESOURCES, MOCK_PATH_CURRICULUM, loadStore, saveStore
} from './adminMockData';

export default function AdminManageLearningPaths() {
  const [paths, setPaths] = useState(() => loadStore('paths', MOCK_PATHS));
  const [curriculum, setCurriculum] = useState(() => loadStore('curriculum', MOCK_PATH_CURRICULUM));
  const [selectedId, setSelectedId] = useState(MOCK_PATHS[0].id);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', difficulty: 'BEGINNER', color: '#d97706' });
  const [dragId, setDragId] = useState(null);

  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast(prev => ({ ...prev, show: false })), []);

  const persistPaths = (next) => { setPaths(next); saveStore('paths', next); };
  const persistCur = (next) => { setCurriculum(next); saveStore('curriculum', next); };

  const selected = paths.find(p => p.id === selectedId) || paths[0];
  const topicOrder = curriculum[selected?.id] || [];
  const orderedTopics = topicOrder.map(id => MOCK_TOPICS.find(t => t.id === id)).filter(Boolean);
  const resources = loadStore('resources', MOCK_RESOURCES);

  const availableResources = useMemo(
    () => resources.filter(r => String(r.learningPathId) === String(selected?.id)),
    [resources, selected]
  );

  const moveTopic = (index, dir) => {
    const nextOrder = [...topicOrder];
    const target = index + dir;
    if (target < 0 || target >= nextOrder.length) return;
    [nextOrder[index], nextOrder[target]] = [nextOrder[target], nextOrder[index]];
    persistCur({ ...curriculum, [selected.id]: nextOrder });
  };

  const onDrop = (overId) => {
    if (dragId == null || dragId === overId) return;
    const next = [...topicOrder];
    const from = next.indexOf(dragId);
    const to = next.indexOf(overId);
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    persistCur({ ...curriculum, [selected.id]: next });
    setDragId(null);
  };

  const savePath = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (modal === 'edit') {
      persistPaths(paths.map(p => p.id === selected.id ? { ...p, ...form } : p));
      showToast('success', 'Learning path updated.');
    } else {
      const id = Date.now();
      persistPaths([...paths, { id, name: form.name, slug: form.name.toLowerCase().replace(/\s+/g, '-'), difficulty: form.difficulty, enrolled: 0, topics: 0, published: false, color: form.color }]);
      persistCur({ ...curriculum, [id]: [] });
      setSelectedId(id);
      showToast('success', 'Learning path created.');
    }
    setModal(null);
  };

  const deletePath = (path) => {
    if (!window.confirm(`Remove "${path.name}" from the catalog?`)) return;
    const next = paths.filter(p => p.id !== path.id);
    persistPaths(next);
    if (selectedId === path.id) setSelectedId(next[0]?.id);
    showToast('success', 'Path removed.');
  };

  const addTopicToPath = (topicId) => {
    if (topicOrder.includes(topicId)) return;
    persistCur({ ...curriculum, [selected.id]: [...topicOrder, topicId] });
    showToast('success', 'Topic added to curriculum.');
    setModal(null);
  };

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <h1 className="ap-page-title">Learning Paths</h1>
          <p className="ap-page-sub">Design ordered curricula and attach existing resources to each path</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ name: '', difficulty: 'BEGINNER', color: '#d97706' }); setModal('create'); }}>
          <FiPlus /> New Path
        </button>
      </div>

      <div className="ap-grid-2 ap-grid-sidebar">
        <div className="ap-card-solid" style={{ padding: '16px' }}>
          {paths.map(path => (
            <button key={path.id} onClick={() => setSelectedId(path.id)}
              style={{
                width: '100%', textAlign: 'left', border: selectedId === path.id ? '2px solid #d97706' : '1px solid #e2e8f0',
                background: selectedId === path.id ? 'linear-gradient(135deg, #fffbeb, #fff)' : '#fff',
                borderRadius: '12px', padding: '14px', marginBottom: '10px', cursor: 'pointer'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#111827' }}>{path.name}</strong>
                <span className="ap-badge" style={{ background: path.published ? '#ECFDF5' : '#F1F5F9', color: path.published ? '#059669' : '#64748b' }}>
                  {path.published ? 'Live' : 'Draft'}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px', display: 'flex', gap: '12px' }}>
                <span><FiUsers size={12} /> {path.enrolled}</span>
                <span><FiBook size={12} /> {(curriculum[path.id] || []).length} topics</span>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="ap-card-solid">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{selected.name}</h2>
                <p style={{ color: '#64748b', margin: '4px 0 0' }}>Drag topics to reorder · {selected.difficulty}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="ap-ghost-btn" onClick={() => setModal('add-resource')}>Attach resource</button>
                <button className="ap-ghost-btn" onClick={() => setModal('add-topic')}>Add topic</button>
                <button className="ap-ghost-btn" onClick={() => { setForm({ name: selected.name, difficulty: selected.difficulty, color: selected.color }); setModal('edit'); }}><FiEdit2 /> Edit</button>
                <button className="ap-danger-btn" onClick={() => deletePath(selected)}><FiTrash2 /> Delete</button>
              </div>
            </div>

            {orderedTopics.length === 0 ? (
              <div style={{ border: '2px dashed #e2e8f0', borderRadius: '14px', padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                No topics yet. Add a topic to start sequencing this path.
              </div>
            ) : orderedTopics.map((topic, index) => (
              <div
                key={topic.id}
                draggable
                onDragStart={() => setDragId(topic.id)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDrop(topic.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                  border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '10px',
                  background: dragId === topic.id ? '#fffbeb' : '#fff', cursor: 'grab'
                }}
              >
                <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: topic.color, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '0.75rem' }}>{index + 1}</span>
                <span style={{ fontSize: '1.2rem' }}>{topic.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{topic.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{topic.resources} resources · {topic.description}</div>
                </div>
                <button className="ap-icon-btn" onClick={() => moveTopic(index, -1)}><FiChevronUp /></button>
                <button className="ap-icon-btn" onClick={() => moveTopic(index, 1)}><FiChevronDown /></button>
                <button className="ap-icon-btn" style={{ color: '#ef4444' }} onClick={() => persistCur({ ...curriculum, [selected.id]: topicOrder.filter(id => id !== topic.id) })}>
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="ap-overlay" onClick={() => setModal(null)}>
          <div className="ap-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>
                {modal === 'create' && 'Create learning path'}
                {modal === 'edit' && 'Edit learning path'}
                {modal === 'add-topic' && 'Add existing topic'}
                {modal === 'add-resource' && 'Attach existing resource'}
              </h3>
              <button className="ap-icon-btn" onClick={() => setModal(null)}><FiX /></button>
            </div>

            {(modal === 'create' || modal === 'edit') && (
              <form onSubmit={savePath}>
                <label style={{ fontWeight: 700, fontSize: '0.82rem' }}>Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                  style={{ width: '100%', margin: '6px 0 14px', padding: '10px', borderRadius: '10px', border: '1px solid #d1d5db' }} />
                <div className="ap-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontWeight: 700, fontSize: '0.82rem' }}>Difficulty</label>
                    <select className="form-select" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} style={{ width: '100%', marginTop: '6px', padding: '10px', borderRadius: '10px' }}>
                      <option>BEGINNER</option><option>INTERMEDIATE</option><option>ADVANCED</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, fontSize: '0.82rem' }}>Accent</label>
                    <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ width: '100%', height: '42px', marginTop: '6px', border: 'none', background: 'none' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                  <button type="button" className="ap-ghost-btn" onClick={() => setModal(null)}>Cancel</button>
                  <button className="btn btn-primary" type="submit">Save</button>
                </div>
              </form>
            )}

            {modal === 'add-topic' && (
              <div>
                {MOCK_TOPICS.filter(t => !topicOrder.includes(t.id)).map(t => (
                  <button key={t.id} onClick={() => addTopicToPath(t.id)} className="ap-ghost-btn" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '8px', padding: '12px' }}>
                    {t.icon} {t.name} <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>{t.resources} resources</span>
                  </button>
                ))}
              </div>
            )}

            {modal === 'add-resource' && (
              <div>
                {availableResources.length === 0 && <p style={{ color: '#64748b' }}>No resources tagged to this path yet. Create one from Resources.</p>}
                {availableResources.map(r => (
                  <div key={r.id} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '8px' }}>
                    <strong>{r.title}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{r.type} · {r.topicName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
