'use client';

export default function RowShuffleButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Shuffle this row"
      title="Shuffle"
      className="w-7 h-7 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center cursor-pointer hover:bg-[var(--bg-elevated)] hover:border-[var(--border-hover)] transition-colors duration-200 group"
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--text-tertiary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="group-hover:stroke-[var(--accent)] transition-colors duration-200"
        aria-hidden="true"
      >
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
    </button>
  );
}
