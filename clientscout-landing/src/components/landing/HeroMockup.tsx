const layoutPreviews = [
  {
    name: 'Corporate',
    tag: 'Recommended',
    gradient: 'from-teal-500 via-emerald-500 to-cyan-600',
    accent: 'border-teal-400 ring-2 ring-teal-400/30',
    featured: true,
  },
  {
    name: 'Creative',
    tag: 'Alt',
    gradient: 'from-violet-600 via-fuchsia-500 to-indigo-600',
    accent: 'border-slate-200',
    featured: false,
  },
  {
    name: 'Minimal',
    tag: 'New',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    accent: 'border-slate-200',
    featured: false,
  },
];

const HeroMockup = () => {
  return (
    <div className="relative w-full max-w-md sm:max-w-lg mx-auto lg:max-w-none lg:mx-0 hero-mockup-perspective px-1 sm:px-0">
      {/* Connection lines — desktop only */}
      <svg
        className="absolute -left-8 xl:-left-16 top-1/2 -translate-y-1/2 w-12 xl:w-20 h-32 xl:h-40 text-teal-300/60 pointer-events-none hidden lg:block"
        viewBox="0 0 80 160"
        fill="none"
        aria-hidden
      >
        <path d="M0 40 Q40 40 80 20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d="M0 80 L80 80" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d="M0 120 Q40 120 80 140" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx="80" cy="20" r="3" fill="currentColor" />
        <circle cx="80" cy="80" r="3" fill="currentColor" />
        <circle cx="80" cy="140" r="3" fill="currentColor" />
      </svg>

      {/* Metric chips — mobile/tablet (in flow, no clip) */}
      <div className="flex flex-wrap justify-center gap-2 mb-3 lg:hidden">
        <div className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 shadow-sm">
          <p className="text-[9px] uppercase tracking-wide text-slate-500">Reply rate</p>
          <p className="text-sm font-extrabold text-emerald-600 leading-none">+3×</p>
        </div>
        <div className="rounded-lg border border-violet-200 bg-white px-3 py-1.5 shadow-sm">
          <p className="text-[9px] uppercase tracking-wide text-slate-500">Time to pitch</p>
          <p className="text-sm font-extrabold text-violet-600 leading-none">5 min</p>
        </div>
      </div>

      <div className="relative lg:animate-float">
        <div className="absolute -inset-4 sm:-inset-6 rounded-[2rem] bg-gradient-to-br from-teal-400/40 via-violet-400/25 to-blue-500/30 blur-2xl animate-pulse-glow" />

        {/* Metric chips — desktop (floating) */}
        <div className="absolute -top-4 right-0 sm:-top-5 sm:-right-5 z-20 rounded-xl border border-emerald-200 bg-white px-3 py-2 shadow-xl hidden lg:block">
          <p className="text-[9px] uppercase tracking-wide text-slate-500">Reply rate</p>
          <p className="text-base font-extrabold text-emerald-600 leading-none">+3×</p>
        </div>
        <div className="absolute -bottom-4 left-0 sm:-bottom-5 sm:-left-5 z-20 rounded-xl border border-violet-200 bg-white px-3 py-2 shadow-xl hidden lg:block">
          <p className="text-[9px] uppercase tracking-wide text-slate-500">Time to pitch</p>
          <p className="text-sm font-extrabold text-violet-600 leading-tight">5 min</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white shadow-[0_20px_50px_-15px_rgba(15,23,42,0.3)] lg:shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35)] backdrop-blur-sm lg:hero-mockup-tilt">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-3 py-2 min-w-0">
            <div className="flex gap-1 shrink-0">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate min-w-0">
              ClientScout — Lead workspace
            </span>
            <span className="rounded-md bg-teal-500 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold text-white shrink-0">
              LIVE
            </span>
          </div>

          <div className="p-3 sm:p-3 space-y-2.5 bg-gradient-to-b from-white to-slate-50/80">
            <div className="flex gap-2 sm:gap-2.5 rounded-lg border border-slate-100 bg-white p-2 sm:p-2.5 shadow-sm min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 shrink-0 shadow-md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-xs truncate">Sunrise Dental Clinic</p>
                <p className="text-[10px] text-slate-500 truncate">Mumbai · 4.6★ · SSL missing</p>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded shrink-0 border border-violet-100">
                AI Ready
              </span>
            </div>

            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
              AI-generated website previews
            </p>

            <div className="grid grid-cols-3 gap-1 sm:gap-1.5 min-w-0">
              {layoutPreviews.map((layout) => (
                <div
                  key={layout.name}
                  className={`rounded-lg border overflow-hidden shadow-sm min-w-0 ${layout.accent}`}
                >
                  <div
                    className={`h-12 sm:h-16 bg-gradient-to-br ${layout.gradient} p-1 sm:p-1.5 flex flex-col justify-between relative`}
                  >
                    <div className="flex gap-0.5">
                      <div className="h-1 w-1 rounded-full bg-white/50" />
                      <div className="h-1 w-1 rounded-full bg-white/50" />
                      <div className="h-1 w-1 rounded-full bg-white/50" />
                    </div>
                    <span className="text-[7px] sm:text-[8px] font-bold text-white drop-shadow truncate">
                      {layout.name}
                    </span>
                  </div>
                  <div className="px-1 py-0.5 bg-white flex justify-between items-center gap-0.5">
                    <span className="text-[7px] sm:text-[8px] text-slate-500 truncate">{layout.tag}</span>
                    {layout.featured && (
                      <span className="text-[7px] sm:text-[8px] text-teal-600 font-bold shrink-0">★</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-1.5">
              <div className="flex-1 min-h-[28px] sm:h-7 rounded-lg bg-slate-900 text-white text-[9px] sm:text-[10px] font-semibold flex items-center justify-center shadow-md px-1 text-center">
                Share design link
              </div>
              <div className="flex-1 min-h-[28px] sm:h-7 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-[9px] sm:text-[10px] font-semibold flex items-center justify-center shadow-md shadow-teal-500/30 px-1 text-center">
                Send pitch email
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroMockup;
