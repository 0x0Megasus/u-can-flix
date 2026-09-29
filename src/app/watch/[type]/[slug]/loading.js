/**
 * Shown while the watch page fetches its data on the server (details,
 * seasons, similar). Mirrors the TmdbWatch layout so the swap-in doesn't
 * jump around.
 */
export default function WatchLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-24" role="status" aria-label="Loading title">
      <span className="sr-only">Loading title…</span>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-[var(--bg-primary)]/40" aria-hidden="true" />

        <div className="relative page-shell pt-[70px] pb-8">
          <div className="skeleton h-5 w-16 mb-6" aria-hidden="true" />

          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="skeleton w-32 md:w-44 aspect-[2/3] rounded-[var(--radius-lg)]! shrink-0" aria-hidden="true" />

            <div className="flex-1 min-w-0 w-full">
              <div className="skeleton h-6 w-24 rounded-full! mb-3" aria-hidden="true" />
              <div className="skeleton h-10 w-3/4 mb-2" aria-hidden="true" />
              <div className="skeleton h-10 w-1/2 mb-5" aria-hidden="true" />
              <div className="flex gap-2 mb-5" aria-hidden="true">
                <div className="skeleton h-6 w-16 rounded-full!" />
                <div className="skeleton h-6 w-20 rounded-full!" />
                <div className="skeleton h-6 w-24 rounded-full!" />
              </div>
              <div className="skeleton h-3.5 w-full mb-2" aria-hidden="true" />
              <div className="skeleton h-3.5 w-full mb-2" aria-hidden="true" />
              <div className="skeleton h-3.5 w-2/3" aria-hidden="true" />
            </div>
          </div>

          {/* Spinner: the one explicit "something is happening" signal. */}
          <div className="flex items-center gap-3 mt-8" aria-hidden="true">
            <span className="w-6 h-6 rounded-full border-2 border-white/15 border-t-[var(--accent)] animate-spin" />
            <span className="text-sm text-[var(--text-tertiary)]">Fetching title details…</span>
          </div>
        </div>
      </div>

      <div className="page-shell">
        <div className="flex flex-col gap-1.5 py-2" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <div className="skeleton w-8 h-8 rounded-md! shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="skeleton h-3 rounded! w-2/3 mb-1.5" />
                <div className="skeleton h-2.5 rounded! w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="page-shell mt-7 pb-8" aria-hidden="true">
        <div className="skeleton h-11 w-36 rounded-full!" />
      </div>

      <section className="page-shell pb-16" aria-hidden="true">
        <div className="skeleton h-6 w-40 mb-5" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton aspect-[2/3] w-full rounded-[var(--radius-md)]! mb-2" />
              <div className="skeleton h-3 w-3/4 mb-1.5" />
              <div className="skeleton h-2.5 w-1/3" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
