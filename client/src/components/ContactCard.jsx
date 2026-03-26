import Avatar, { getTagColor } from './Avatar';

export default function ContactCard({ contact, onEdit, onDelete }) {
  return (
    <div className="group relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 hover:border-[#3a3a3a] hover:bg-[#1e1e1e] transition-all duration-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar contact={contact} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm leading-tight truncate">{contact.name}</h3>
          {contact.company && (
            <p className="text-[#888] text-xs mt-0.5 truncate">{contact.company}</p>
          )}
        </div>

        {/* Actions - appear on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => onEdit(contact)}
            className="p-1.5 rounded-lg text-[#666] hover:text-white hover:bg-[#2a2a2a] transition-all"
            title="Edit"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="p-1.5 rounded-lg text-[#666] hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex flex-col gap-1.5">
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-2 text-xs text-[#888] hover:text-[#a78bfa] transition-colors group/link"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span className="truncate">{contact.email}</span>
          </a>
        )}
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="flex items-center gap-2 text-xs text-[#888] hover:text-[#a78bfa] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6.29 6.29l1.46-1.46a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span className="truncate">{contact.phone}</span>
          </a>
        )}
      </div>

      {/* Notes preview */}
      {contact.notes && (
        <p className="text-xs text-[#666] line-clamp-2 leading-relaxed">{contact.notes}</p>
      )}

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {contact.tags.map(tag => (
            <span key={tag} className={`tag-pill ${getTagColor(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
