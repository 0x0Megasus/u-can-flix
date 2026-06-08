export default function LoadingSkeleton({ count = 6, title = '', grid = false }) {
  return (
    <section className="mb-10">
      <div className="px-4 sm:px-10 mb-5">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">{title || '\u00A0'}</h2>
      </div>
      <div className={grid
        ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 px-4 sm:px-10'
        : 'flex gap-3 px-4 sm:px-10 overflow-hidden'
      }>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]">
            <div className="aspect-[2/3] rounded-[var(--radius-md)] skeleton mb-2" />
            <div className="h-3 rounded skeleton w-full mb-1.5" />
            <div className="h-3 w-3/5 rounded skeleton" />
          </div>
        ))}
      </div>
    </section>
  )
}
