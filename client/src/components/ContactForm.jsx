import { useState, useEffect, useRef } from 'react';
import Avatar from './Avatar';

export default function ContactForm({ contact, onSave, onClose }) {
  const isEdit = !!contact;
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    tags: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanToast, setScanToast] = useState('');
  const fileInputRef = useRef();
  const cardInputRef = useRef();
  const firstInputRef = useRef();

  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        notes: contact.notes || '',
        tags: Array.isArray(contact.tags) ? contact.tags.join(', ') : '',
      });
      if (contact.photo) {
        setPhotoPreview(`/uploads/${contact.photo}`);
      }
    }
    setTimeout(() => firstInputRef.current?.focus(), 50);
  }, [contact]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleCardScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Also set it as the contact photo
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);

    setScanning(true);
    setScanToast('');
    setError('');

    try {
      const fd = new FormData();
      fd.append('card', file);
      const res = await fetch('/api/contacts/scan-card', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Scan failed');
      }

      const data = await res.json();
      const c = data.contact || {};

      setForm(f => ({
        ...f,
        name: c.name || f.name,
        email: c.email || f.email,
        phone: c.phone || f.phone,
        company: c.company || f.company,
      }));

      setScanToast('✨ Card scanned! Fields auto-filled.');
      setTimeout(() => setScanToast(''), 4000);
    } catch (err) {
      setError(`Card scan failed: ${err.message}. You can still fill in fields manually.`);
    } finally {
      setScanning(false);
      // Reset file input so same file can be re-selected
      if (cardInputRef.current) cardInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const tags = form.tags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);

      const payload = { ...form, tags };
      let saved;

      if (isEdit) {
        const res = await fetch(`/api/contacts/${contact.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to save');
        saved = await res.json();
      } else {
        const res = await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to save');
        saved = await res.json();
      }

      // Upload photo if selected
      if (photoFile) {
        const fd = new FormData();
        fd.append('photo', photoFile);
        const res = await fetch(`/api/contacts/${saved.id}/photo`, {
          method: 'POST',
          body: fd,
        });
        if (res.ok) {
          saved = await res.json();
        }
      }

      onSave(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Keyboard handler
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
          <h2 className="text-base font-semibold text-white">
            {isEdit ? 'Edit Contact' : 'New Contact'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#666] hover:text-white hover:bg-[#2a2a2a] transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Scan success toast */}
          {scanToast && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
              {scanToast}
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Business Card Scanner */}
          <div className="mb-6 p-4 rounded-xl border border-dashed border-[#8b5cf6]/40 bg-[#8b5cf6]/5 hover:border-[#8b5cf6]/60 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#8b5cf6]/20 flex items-center justify-center flex-shrink-0">
                  {scanning ? (
                    <svg className="animate-spin w-4 h-4 text-[#a78bfa]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 3H8"/>
                      <path d="M12 3v4"/>
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#a78bfa]">
                    {scanning ? 'Scanning card...' : 'Scan Business Card'}
                  </p>
                  <p className="text-xs text-[#666] mt-0.5">
                    {scanning ? 'Extracting contact info with AI...' : 'Upload a photo to auto-fill all fields'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={scanning}
                onClick={() => cardInputRef.current?.click()}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#8b5cf6]/20 text-[#a78bfa] hover:bg-[#8b5cf6]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {scanning ? 'Scanning...' : 'Upload Card'}
              </button>
            </div>
            <input
              ref={cardInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCardScan}
            />
          </div>

          {/* Photo Upload */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="relative cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className={`w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#666] group-hover:bg-[#333] transition-colors`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-[#a78bfa] hover:text-[#8b5cf6] transition-colors font-medium"
              >
                {photoPreview ? 'Change photo' : 'Upload photo'}
              </button>
              <p className="text-xs text-[#666] mt-0.5">JPG, PNG, WebP up to 5MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Name *</label>
              <input
                ref={firstInputRef}
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#555] focus:border-[#8b5cf6] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@company.com"
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#555] focus:border-[#8b5cf6] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#555] focus:border-[#8b5cf6] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Company</label>
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Company or organization"
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#555] focus:border-[#8b5cf6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Tags</label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="investor, tech, sf (comma-separated)"
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#555] focus:border-[#8b5cf6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Add notes, context, how you met..."
                rows={3}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#555] focus:border-[#8b5cf6] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[#888] bg-[#222] hover:bg-[#2a2a2a] hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
