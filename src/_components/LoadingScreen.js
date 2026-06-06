export default function LoadingScreen() {
  return (
    <section className="pt-[100px] px-4 sm:px-10 pb-12">
      <div className="mb-8 max-w-[1440px] mx-auto">
        <div className="h-8 w-48 bg-[#222] rounded animate-shimmer mb-6" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[250px] lg:w-[280px]">
              <div className="aspect-[2/3] rounded bg-[#222] animate-shimmer mb-2" />
              <div className="h-3 rounded bg-[#222] animate-shimmer mb-1.5" />
              <div className="h-3 w-3/5 rounded bg-[#222] animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
      <div className="mb-8 max-w-[1440px] mx-auto">
        <div className="h-8 w-48 bg-[#222] rounded animate-shimmer mb-6" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[250px] lg:w-[280px]">
              <div className="aspect-[2/3] rounded bg-[#222] animate-shimmer mb-2" />
              <div className="h-3 rounded bg-[#222] animate-shimmer mb-1.5" />
              <div className="h-3 w-3/5 rounded bg-[#222] animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto">
        <div className="h-8 w-48 bg-[#222] rounded animate-shimmer mb-6" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[250px] lg:w-[280px]">
              <div className="aspect-[2/3] rounded bg-[#222] animate-shimmer mb-2" />
              <div className="h-3 rounded bg-[#222] animate-shimmer mb-1.5" />
              <div className="h-3 w-3/5 rounded bg-[#222] animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
