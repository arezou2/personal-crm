import { useState, useEffect, useCallback } from 'react';
import ContactCard from './components/ContactCard';
import ContactForm from './components/ContactForm';
import SearchBar from './components/SearchBar';
import EmptyState from './components/EmptyState';
import DeleteConfirm from './components/DeleteConfirm';
import { getTagColor } from './components/Avatar';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [deleteContact, setDeleteContact] = useState(null);
  const [toast, setToast] = useState(null);

  const debouncedSearch = useDebounce(search, 250);

  const fetchContacts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (activeTag) params.set('tag', activeTag);
      const res = await fetch(`/api/contacts?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      showToast('Failed to load contacts', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeTag]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (saved) => {
    setContacts(prev => {
      const exists = prev.find(c => c.id === saved.id);
      if (exists) {
        return prev.map(c => c.id === saved.id ? saved : c);
      }
      return [saved, ...prev];
    });
    setShowForm(false);
    setEditContact(null);
    showToast(editContact ? 'Contact updated' : 'Contact added');
  };

  const handleDelete = async (contact) => {
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setContacts(prev => prev.filter(c => c.id !== contact.id));
      setDeleteContact(null);
      showToast('Contact deleted');
    } catch (err) {
      showToast('Failed to delete contact', 'error');
    }
  };

  const handleEdit = (contact) => {
    setEditContact(contact);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditContact(null);
    setShowForm(true);
  };

  // Collect all unique tags from contacts
  const allTags = [...new Set(contacts.flatMap(c => c.tags || []))].sort();

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-[#1e1e1e]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-[#8b5cf6] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span className="font-semibold text-white text-sm hidden sm:block">Contacts</span>
            </div>

            {/* Search */}
            <SearchBar value={search} onChange={setSearch} />

            {/* Add button */}
            <button
              onClick={handleAddNew}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-medium rounded-xl transition-all hover:shadow-[0_4px_16px_rgba(139,92,246,0.3)]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span className="hidden sm:block">Add Contact</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats bar */}
        {!loading && contacts.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-[#666]">
              {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
              {debouncedSearch && <span className="text-[#888]"> matching "{debouncedSearch}"</span>}
              {activeTag && <span className="text-[#888]"> tagged "{activeTag}"</span>}
            </p>
          </div>
        )}

        {/* Tag filters */}
        {!loading && allTags.length > 0 && !debouncedSearch && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTag(null)}
              className={`tag-pill transition-all ${
                !activeTag
                  ? 'bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]/30'
                  : 'bg-[#1a1a1a] text-[#666] border border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-[#888]'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`tag-pill transition-all ${
                  activeTag === tag
                    ? `${getTagColor(tag)} border border-current/20`
                    : 'bg-[#1a1a1a] text-[#666] border border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-[#888]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 h-44 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && contacts.length === 0 && (
          <EmptyState search={debouncedSearch} onAdd={handleAddNew} />
        )}

        {/* Contacts grid */}
        {!loading && contacts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {contacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={handleEdit}
                onDelete={setDeleteContact}
              />
            ))}
          </div>
        )}
      </main>

      {/* Form modal */}
      {showForm && (
        <ContactForm
          contact={editContact}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditContact(null); }}
        />
      )}

      {/* Delete confirm */}
      {deleteContact && (
        <DeleteConfirm
          contact={deleteContact}
          onConfirm={handleDelete}
          onClose={() => setDeleteContact(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all ${
          toast.type === 'error'
            ? 'bg-red-900/90 border border-red-500/30 text-red-300'
            : 'bg-[#1a1a1a] border border-[#2a2a2a] text-white'
        }`}>
          {toast.type !== 'error' && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
