export default function LoadingScreen() {
  return (
    <section className="pt-[100px] px-4 sm:px-10 pb-12">
      <div className="mb-10 max-w-[1440px] mx-auto">
        <div className="h-7 w-48 skeleton mb-6 rounded-[var(--radius-sm)]" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]">
              <div className="aspect-[2/3] rounded-[var(--radius-md)] skeleton mb-2" />
              <div className="h-3 rounded skeleton w-full mb-1.5" />
              <div className="h-3 w-3/5 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>
      <div className="mb-10 max-w-[1440px] mx-auto">
        <div className="h-7 w-48 skeleton mb-6 rounded-[var(--radius-sm)]" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]">
              <div className="aspect-[2/3] rounded-[var(--radius-md)] skeleton mb-2" />
              <div className="h-3 rounded skeleton w-full mb-1.5" />
              <div className="h-3 w-3/5 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto">
        <div className="h-7 w-48 skeleton mb-6 rounded-[var(--radius-sm)]" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]">
              <div className="aspect-[2/3] rounded-[var(--radius-md)] skeleton mb-2" />
              <div className="h-3 rounded skeleton w-full mb-1.5" />
              <div className="h-3 w-3/5 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
