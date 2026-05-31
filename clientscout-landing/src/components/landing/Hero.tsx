import {
  ArrowRight,
  MapPin,
  Globe,
  Mail,
  Trophy,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

const workflowSteps = [
  { icon: MapPin, label: 'Discover local businesses' },
  { icon: Globe, label: 'Generate website concepts' },
  { icon: Mail, label: 'Send personalized pitches' },
  { icon: Trophy, label: 'Win more clients' },
];

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

const Hero = () => {
  return (
    <section className="relative mesh-hero grid-pattern overflow-hidden min-h-[calc(100svh-4rem)] flex items-center pt-20 pb-8 lg:pt-24 lg:pb-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/3 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" />
        <div className="absolute top-10 -right-16 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Copy */}
          <div className="text-center lg:text-left order-1">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500" />
                </span>
                Maps → AI mockups → Outreach
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-md shadow-teal-500/25">
                +3× reply rate
              </div>
            </div>

            <h1 className="text-[1.75rem] sm:text-4xl lg:text-[2.65rem] font-extrabold text-slate-900 tracking-tight mb-3 leading-[1.1]">
              Find leads, generate website mockups, and{' '}
              <span className="text-gradient">close clients faster.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 mb-4 leading-snug max-w-xl mx-auto lg:mx-0">
              The only workflow built for freelancers: Google Maps discovery → AI website proposals →
              personalized outreach — in one platform.
            </p>

            {/* Visible workflow — core USP */}
            <div className="mb-5 rounded-xl border border-slate-200 bg-white/80 p-3 sm:p-4 shadow-sm max-w-xl mx-auto lg:mx-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 text-left">
                How ClientScout works
              </p>
              <ol className="space-y-1.5">
                {workflowSteps.map((step, i) => (
                  <li key={step.label} className="flex items-center gap-2 text-left">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-50 text-[10px] font-bold text-teal-700">
                      {i + 1}
                    </span>
                    <step.icon size={14} className="shrink-0 text-teal-600" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">{step.label}</span>
                    {i < workflowSteps.length - 1 && (
                      <ChevronDown size={12} className="ml-auto hidden sm:block text-slate-300 rotate-[-90deg] lg:hidden" />
                    )}
                  </li>
                ))}
              </ol>
              <p className="mt-2.5 text-[10px] sm:text-xs text-teal-700 font-semibold text-left flex items-center gap-1">
                <span className="inline-block h-1 w-1 rounded-full bg-teal-500" />
                5 minutes → personalized proposal ready to send
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 mb-4">
              <a
                href="https://app.clientscout.xyz/signup"
                className="group px-6 py-3 sm:px-7 sm:py-3.5 bg-slate-900 text-white rounded-xl font-bold text-base sm:text-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/15 flex items-center justify-center gap-2"
              >
                Start free trial
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="px-6 py-3 sm:px-7 sm:py-3.5 bg-white text-slate-800 border border-slate-200 rounded-xl font-bold text-base sm:text-lg hover:border-teal-300 hover:bg-teal-50/50 transition-all flex items-center justify-center"
              >
                See how it works
              </a>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 font-medium flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-teal-500 shrink-0" />
                No credit card
              </span>
              <span className="text-slate-300 hidden sm:inline">·</span>
              <span>Pay-as-you-go</span>
              <span className="text-slate-300 hidden sm:inline">·</span>
              <span>No lock-in</span>
            </p>
          </div>

          {/* Dramatic mockup — desktop */}
          <div className="order-2 hidden lg:block relative max-w-md xl:max-w-lg justify-self-end w-full hero-mockup-perspective">
            {/* Connection lines */}
            <svg
              className="absolute -left-16 top-1/2 -translate-y-1/2 w-20 h-40 text-teal-300/60 pointer-events-none"
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

            <div className="relative animate-float">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-teal-400/40 via-violet-400/25 to-blue-500/30 blur-2xl animate-pulse-glow" />
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-teal-500/10 to-violet-500/10" />

              <div className="absolute -top-5 -right-5 z-20 rounded-xl border border-emerald-200 bg-white px-3 py-2 shadow-xl">
                <p className="text-[9px] uppercase tracking-wide text-slate-500">Reply rate</p>
                <p className="text-base font-extrabold text-emerald-600 leading-none">+3×</p>
              </div>
              <div className="absolute -bottom-5 -left-5 z-20 rounded-xl border border-violet-200 bg-white px-3 py-2 shadow-xl">
                <p className="text-[9px] uppercase tracking-wide text-slate-500">Time to pitch</p>
                <p className="text-sm font-extrabold text-violet-600 leading-tight">5 min</p>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35)] backdrop-blur-sm hero-mockup-tilt">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium truncate">
                    ClientScout — Lead workspace
                  </span>
                  <span className="rounded-md bg-teal-500 px-1.5 py-0.5 text-[9px] font-bold text-white">LIVE</span>
                </div>

                <div className="p-3 space-y-2.5 bg-gradient-to-b from-white to-slate-50/80">
                  <div className="flex gap-2.5 rounded-lg border border-slate-100 bg-white p-2.5 shadow-sm">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 shrink-0 shadow-md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-xs truncate">Sunrise Dental Clinic</p>
                      <p className="text-[10px] text-slate-500">Mumbai · 4.6★ · SSL missing</p>
                    </div>
                    <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded shrink-0 border border-violet-100">
                      AI Ready
                    </span>
                  </div>

                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
                    AI-generated website previews
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {layoutPreviews.map((layout) => (
                      <div
                        key={layout.name}
                        className={`rounded-lg border overflow-hidden shadow-sm ${layout.accent}`}
                      >
                        <div className={`h-16 bg-gradient-to-br ${layout.gradient} p-1.5 flex flex-col justify-between relative`}>
                          <div className="flex gap-0.5">
                            <div className="h-1 w-1 rounded-full bg-white/50" />
                            <div className="h-1 w-1 rounded-full bg-white/50" />
                            <div className="h-1 w-1 rounded-full bg-white/50" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="h-1 w-8 rounded bg-white/40" />
                            <div className="h-1 w-5 rounded bg-white/25" />
                          </div>
                          <span className="text-[8px] font-bold text-white drop-shadow">{layout.name}</span>
                        </div>
                        <div className="px-1 py-0.5 bg-white flex justify-between items-center">
                          <span className="text-[8px] text-slate-500">{layout.tag}</span>
                          {layout.featured && <span className="text-[8px] text-teal-600 font-bold">★</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1.5">
                    <div className="flex-1 h-7 rounded-lg bg-slate-900 text-white text-[10px] font-semibold flex items-center justify-center shadow-md">
                      Share design link
                    </div>
                    <div className="flex-1 h-7 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-[10px] font-semibold flex items-center justify-center shadow-md shadow-teal-500/30">
                      Send pitch email
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
