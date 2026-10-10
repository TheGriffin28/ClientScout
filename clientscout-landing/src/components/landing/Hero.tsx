import {
  ArrowRight,
  MapPin,
  Globe,
  Mail,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import HeroMockup from './HeroMockup';

const workflowSteps = [
  { icon: MapPin, label: 'Discover local businesses' },
  { icon: Globe, label: 'Generate website concepts' },
  { icon: Mail, label: 'Send personalized pitches' },
  { icon: Trophy, label: 'Win more clients' },
];

const Hero = () => {
  return (
    <section className="relative mesh-hero grid-pattern overflow-x-hidden pt-20 pb-10 sm:pt-24 sm:pb-12 lg:min-h-[calc(100svh-4rem)] lg:flex lg:items-center lg:py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/3 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" />
        <div className="absolute top-10 -right-16 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center gap-8">
          {/* Left: copy */}
          <div className="text-center lg:text-left flex flex-col gap-5 sm:gap-6 order-1">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
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

            <h1 className="text-[1.65rem] sm:text-4xl lg:text-[2.65rem] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Find leads, generate website mockups, and{' '}
              <span className="text-gradient">close clients faster.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-snug max-w-xl mx-auto lg:mx-0">
              The only workflow built for freelancers: Google Maps discovery → AI website proposals →
              personalized outreach — in one platform.
            </p>

            {/* Mockup on mobile/tablet — between intro and workflow */}
            <div className="lg:hidden w-full">
              <HeroMockup />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/80 p-3 sm:p-4 shadow-sm max-w-xl mx-auto lg:mx-0 w-full">
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
                  </li>
                ))}
              </ol>
              <p className="mt-2.5 text-[10px] sm:text-xs text-teal-700 font-semibold text-left flex items-center gap-1">
                <span className="inline-block h-1 w-1 rounded-full bg-teal-500 shrink-0" />
                5 minutes → personalized proposal ready to send
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 w-full max-w-xl mx-auto lg:mx-0">
              <a
                href="https://app.clientscout.xyz/signup"
                className="group px-6 py-3 sm:px-7 sm:py-3.5 bg-slate-900 text-white rounded-xl font-bold text-base sm:text-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/15 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Start free trial
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="px-6 py-3 sm:px-7 sm:py-3.5 bg-white text-slate-800 border border-slate-200 rounded-xl font-bold text-base sm:text-lg hover:border-teal-300 hover:bg-teal-50/50 transition-all flex items-center justify-center w-full sm:w-auto"
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

          {/* Right: mockup desktop */}
          <div className="hidden lg:block order-2 w-full justify-self-end">
            <HeroMockup />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
