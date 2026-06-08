export default function ScrollArrows({ onScroll }) {
  return (
    <div className="flex gap-2">
      <button onClick={() => onScroll('left')} aria-label="Scroll left"
        className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] flex items-center justify-center border border-[var(--border-default)] cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-300 hover:scale-110"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6" /></svg>
      </button>
      <button onClick={() => onScroll('right')} aria-label="Scroll right"
        className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] flex items-center justify-center border border-[var(--border-default)] cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-300 hover:scale-110"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6" /></svg>
      </button>
    </div>
  )
}
