export default function LoadingSkeleton({ count = 6, title = '', grid = false }) {
  return (
    <section className="mb-8">
      <div className="px-4 sm:px-10 mb-4">
        <h2 className="text-xl font-bold text-white">{title || '\u00A0'}</h2>
      </div>
      <div className={grid ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 px-4 sm:px-10' : 'flex gap-3 px-4 sm:px-10 overflow-hidden'}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[250px] lg:w-[280px]">
            <div className="aspect-[2/3] rounded bg-[#222] animate-shimmer mb-2" />
            <div className="h-3 rounded bg-[#222] animate-shimmer mb-1.5" />
            <div className="h-3 w-3/5 rounded bg-[#222] animate-shimmer" />
          </div>
        ))}
      </div>
    </section>
  )
}
