import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit2, Trash2, ExternalLink, Search, Music, FileText } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { motion } from 'framer-motion';

const PeopleManager = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const fetchPeople = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('/api/people', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPeople(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPeople(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this person?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/people/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPeople();
    } catch (error) { console.error(error); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected people?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('/api/people/bulk-delete', { ids: selectedIds }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedIds([]);
      fetchPeople();
    } catch (error) { console.error(error); }
  };

  const filteredPeople = people.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'published') return matchesSearch && p.status === 'published';
    if (filter === 'draft') return matchesSearch && p.status === 'draft';
    if (filter === 'has_song') return matchesSearch && p.songUrl;
    if (filter === 'no_song') return matchesSearch && !p.songUrl;
    return matchesSearch;
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'has_song', label: 'Has Song' },
    { value: 'no_song', label: 'No Song' },
  ];

  // Mobile Card view
  const PersonCard = ({ person }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold truncate">{person.name}</p>
          <p className="text-xs text-white/40 mt-0.5 truncate">{person.slug}</p>
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium border ${
          person.status === 'published'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
        }`}>
          {person.status}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-white/50">
        <span className="flex items-center gap-1">
          <FileText size={12} /> {person.theme}
        </span>
        {person.songUrl && (
          <span className="flex items-center gap-1 text-purple-400">
            <Music size={12} /> Has Song
          </span>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <a
          href={`/message/${person.slug}?preview=true`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ExternalLink size={13} /> Preview
        </a>
        <button
          onClick={() => navigate(`/admin/people/edit/${person._id}`)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 rounded-lg transition-colors"
        >
          <Edit2 size={13} /> Edit
        </button>
        <button
          onClick={() => handleDelete(person._id)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </motion.div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">People</h1>
            <p className="text-white/50 mt-1 text-sm">Manage all the personalized messages.</p>
          </div>
          <button
            onClick={() => navigate('/admin/people/new')}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          >
            <Plus size={20} />
            Add Person
          </button>
        </div>

        {/* Filters + Search */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-black/20 space-y-3">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filter === opt.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <input
                  type="text"
                  placeholder="Search names..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete ({selectedIds.length})
                </button>
              )}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      onChange={(e) => setSelectedIds(e.target.checked ? filteredPeople.map(p => p._id) : [])}
                      checked={selectedIds.length > 0 && selectedIds.length === filteredPeople.length}
                      className="accent-purple-600 w-4 h-4"
                    />
                  </th>
                  <th className="p-4 font-medium text-white/60 text-sm">Name</th>
                  <th className="p-4 font-medium text-white/60 text-sm">Status</th>
                  <th className="p-4 font-medium text-white/60 text-sm">Theme</th>
                  <th className="p-4 font-medium text-white/60 text-sm">Song</th>
                  <th className="p-4 font-medium text-white/60 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="p-10 text-center text-white/50">Loading...</td></tr>
                ) : filteredPeople.length === 0 ? (
                  <tr><td colSpan="6" className="p-10 text-center text-white/50">No people found.</td></tr>
                ) : filteredPeople.map((person) => (
                  <tr key={person._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(person._id)}
                        onChange={() => toggleSelect(person._id)}
                        className="accent-purple-600 w-4 h-4"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{person.name}</div>
                      <div className="text-xs text-white/40">{person.slug}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        person.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      }`}>
                        {person.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-white/70">{person.theme}</td>
                    <td className="p-4 text-sm">
                      {person.songUrl
                        ? <span className="text-purple-400 flex items-center gap-1"><Music size={14} /> Yes</span>
                        : <span className="text-white/30">—</span>}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <a href={`/message/${person.slug}?preview=true`} target="_blank" rel="noopener noreferrer"
                          className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Preview">
                          <ExternalLink size={17} />
                        </a>
                        <button onClick={() => navigate(`/admin/people/edit/${person._id}`)}
                          className="p-2 text-white/40 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                          <Edit2 size={17} />
                        </button>
                        <button onClick={() => handleDelete(person._id)}
                          className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden p-4 space-y-3">
            {loading ? (
              <p className="text-center text-white/50 py-8">Loading...</p>
            ) : filteredPeople.length === 0 ? (
              <p className="text-center text-white/50 py-8">No people found.</p>
            ) : filteredPeople.map(person => (
              <PersonCard key={person._id} person={person} />
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PeopleManager;
