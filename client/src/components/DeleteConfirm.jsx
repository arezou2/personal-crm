export default function DeleteConfirm({ contact, onConfirm, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <h3 className="text-base font-semibold text-white text-center mb-1">Delete contact?</h3>
        <p className="text-sm text-[#666] text-center mb-6">
          <span className="text-[#888] font-medium">{contact.name}</span> will be permanently removed. This can't be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[#888] bg-[#222] hover:bg-[#2a2a2a] hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(contact)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
