import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Upload, Music, Bold, Italic, List } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import AdminLayout from '../../layouts/AdminLayout';

const THEMES = [
  'Midnight Aurora', 'Purple Galaxy', 'Sunset Glow',
  'Ocean Blue', 'Emerald Forest', 'Rose Gold', 'Minimal Dark'
];

const PersonEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    aliases: '',
    relationship: '',
    theme: 'Midnight Aurora',
    status: 'draft',
    songStartTime: '',
    songEndTime: '',
  });

  const [songFile, setSongFile] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4 text-white/90 leading-relaxed',
      },
    },
  });

  useEffect(() => {
    if (isEditing && editor) {
      const fetchPerson = async () => {
        try {
          const token = localStorage.getItem('adminToken');
          const res = await axios.get('/api/people', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const person = res.data.find(p => p._id === id);
          if (person) {
            setFormData({
              name: person.name,
              aliases: person.aliases ? person.aliases.join(', ') : '',
              relationship: person.relationship || '',
              theme: person.theme,
              status: person.status,
              songStartTime: person.songStartTime || '',
              songEndTime: person.songEndTime || '',
            });
            setCurrentSong({ url: person.songUrl, name: person.songName });
            editor.commands.setContent(person.message || '');
          }
        } catch {
          setError('Failed to load person data');
        }
      };
      fetchPerson();
    }
  }, [id, isEditing, editor]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    const html = editor?.getHTML();
    if (!html || html === '<p></p>') {
      setError('Message content is required');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('aliases', formData.aliases);
      data.append('relationship', formData.relationship);
      data.append('theme', formData.theme);
      data.append('status', formData.status);
      data.append('message', html);
      data.append('songStartTime', formData.songStartTime || 0);
      data.append('songEndTime', formData.songEndTime || 0);

      if (songFile) {
        data.append('songFile', songFile);
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isEditing) {
        await axios.put(`/api/people/${id}`, data, config);
      } else {
        await axios.post('/api/people', data, config);
      }
      navigate('/admin/people');
    } catch (err) {
      console.error('Save error:', err?.response?.data || err.message);
      setError(`Failed to save: ${err?.response?.data?.message || err.message}`);
      setSaving(false);
    }
  };

  const ToolbarBtn = ({ onClick, active, children, title }) => (
    <button
      onClick={onClick}
      title={title}
      type="button"
      className={`p-2 rounded-lg text-sm transition-colors ${active ? 'bg-purple-600/30 text-purple-400' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
    >
      {children}
    </button>
  );

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-5 md:space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/people')} className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">{isEditing ? 'Edit Person' : 'Add New Person'}</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 text-sm">
            {error}
          </div>
        )}

        {/* Layout: stacks on mobile, side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">

          {/* Left: Main content */}
          <div className="lg:col-span-2 space-y-5 md:space-y-6">

            {/* Basic Details */}
            <div className="glass-card rounded-2xl p-5 md:p-6 space-y-4">
              <h3 className="font-semibold text-white">Basic Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Relationship</label>
                    <input
                      type="text"
                      value={formData.relationship}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      placeholder="e.g. Best Friend"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Nicknames / Aliases (comma separated)</label>
                  <input
                    type="text"
                    value={formData.aliases}
                    onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                    placeholder="e.g. Babu, Sweety, Honey"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 bg-black/30 flex items-center gap-1 flex-wrap">
                <span className="text-xs text-white/40 mr-2 font-medium uppercase tracking-wider">Message</span>
                <ToolbarBtn title="Bold" onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')}>
                  <Bold size={15} />
                </ToolbarBtn>
                <ToolbarBtn title="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')}>
                  <Italic size={15} />
                </ToolbarBtn>
                <ToolbarBtn title="Bullet List" onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')}>
                  <List size={15} />
                </ToolbarBtn>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <ToolbarBtn title="Paragraph" onClick={() => editor?.chain().focus().setParagraph().run()} active={editor?.isActive('paragraph')}>
                  <span className="text-xs font-medium">¶</span>
                </ToolbarBtn>
                <ToolbarBtn title="Heading" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading')}>
                  <span className="text-xs font-bold">H2</span>
                </ToolbarBtn>
              </div>
              <EditorContent editor={editor} className="bg-white/[0.03] min-h-[220px]" />
            </div>
          </div>

          {/* Right: Settings panel */}
          <div className="space-y-5 md:space-y-6">

            {/* Publish Settings */}
            <div className="glass-card rounded-2xl p-5 md:p-6 space-y-4">
              <h3 className="font-semibold text-white">Settings</h3>

              <div>
                <label className="block text-sm text-white/60 mb-2">Visibility</label>
                <div className="grid grid-cols-2 gap-2">
                  {['draft', 'published'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: s })}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors capitalize border ${
                        formData.status === s
                          ? s === 'published'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Theme</label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 text-sm"
                >
                  {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Music Upload */}
            <div className="glass-card rounded-2xl p-5 md:p-6 space-y-4">
              <h3 className="font-semibold text-white">Background Music</h3>

              {currentSong?.url && !songFile && (
                <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <Music size={16} className="text-purple-400 shrink-0" />
                  <span className="text-sm text-purple-300 truncate">{currentSong.name || 'Uploaded Song'}</span>
                </div>
              )}

              <div className="relative border-2 border-dashed border-white/15 rounded-xl p-5 text-center hover:border-purple-500/40 transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setSongFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="mx-auto h-7 w-7 text-white/30 group-hover:text-purple-400 mb-2 transition-colors" />
                <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
                  {songFile ? (
                    <span className="text-purple-400 font-medium">{songFile.name}</span>
                  ) : (
                    <>Click or drag MP3 to upload</>
                  )}
                </p>
                {songFile && (
                  <p className="text-xs text-white/30 mt-1">{(songFile.size / 1024 / 1024).toFixed(2)} MB</p>
                )}
              </div>

              {songFile && (
                <button
                  onClick={() => setSongFile(null)}
                  className="w-full text-xs text-white/40 hover:text-red-400 transition-colors"
                >
                  Remove selected file
                </button>
              )}

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Start (sec)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.songStartTime}
                    onChange={(e) => setFormData({ ...formData, songStartTime: e.target.value })}
                    placeholder="e.g. 15"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">End (sec)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.songEndTime}
                    onChange={(e) => setFormData({ ...formData, songEndTime: e.target.value })}
                    placeholder="e.g. 60"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Person'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PersonEditor;
