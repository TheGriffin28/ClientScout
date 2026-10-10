import { ShieldAlert, Zap, MousePointerClick, CheckCircle } from 'lucide-react';

const auditCards = [
  {
    icon: Zap,
    title: 'Performance',
    status: 'Poor',
    detail: 'Slow mobile load time',
    color: 'text-amber-700 bg-amber-50/80 border-amber-200',
  },
  {
    icon: ShieldAlert,
    title: 'Trust Signal',
    status: 'Missing SSL',
    detail: 'Browser security warning',
    color: 'text-rose-700 bg-rose-50/80 border-rose-200',
  },
  {
    icon: MousePointerClick,
    title: 'Conversion',
    status: 'No CTAs',
    detail: 'Missing booking button',
    color: 'text-blue-700 bg-blue-50/80 border-blue-200',
  },
];

const HeroMockup = () => {
  return (
    <div className="relative mx-auto max-w-5xl">
      {/* Decorative glows */}
      <div className="absolute -top-12 -left-12 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main app frame */}
      <div className="relative rounded-2xl border border-slate-200/80 bg-white/95 p-2 sm:p-3 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        {/* Browser chrome */}
        <div className="flex items-center justify-between pb-3 px-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <span className="hidden sm:inline-block ml-3 text-xs font-medium text-slate-400">
              app.clientscout.xyz/leads
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● Live Lead Finder
            </span>
          </div>
        </div>

        {/* Dashboard inner layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-3">
          {/* Left panel: Maps lead list */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center justify-between px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Search:</span>
                <span className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                  dentist in mumbai
                </span>
              </div>
              <span className="text-xs text-teal-600 font-bold">24 verified leads</span>
            </div>

            {/* Lead rows */}
            {[
              {
                name: 'Sunrise Dental Clinic',
                rating: '4.6★ (128)',
                phone: '+91 98201 ••••',
                email: 'dr.sharma@sunrisedental.in',
                score: '4.8',
                status: 'Warm',
                active: true,
              },
              {
                name: 'Apex Orthodontics & Implants',
                rating: '4.9★ (312)',
                phone: '+91 98192 ••••',
                email: 'contact@apexortho.com',
                score: '4.2',
                status: 'New',
                active: false,
              },
              {
                name: 'Dr. Mehta Family Care',
                rating: '4.3★ (64)',
                phone: '+91 97690 ••••',
                email: 'Found on website',
                score: '3.6',
                status: 'New',
                active: false,
              },
            ].map((lead) => (
              <div
                key={lead.name}
                className={`p-3 rounded-xl border transition-all ${
                  lead.active
                    ? 'border-teal-500/80 bg-teal-50/40 shadow-sm ring-1 ring-teal-500/20'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm truncate">{lead.name}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lead.rating} · {lead.phone}
                    </p>
                    <p className="text-xs text-teal-700 font-medium truncate mt-0.5">{lead.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-700">Lead Score</span>
                    <p className="text-base font-black text-teal-600">{lead.score}/5</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right panel: AI Website Audit & Pitch */}
          <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-3 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-900">AI Website Audit & Pitch</p>
                <p className="text-[11px] text-slate-500">Sunrise Dental Clinic</p>
              </div>
              <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">
                AI Scored 4.8/5
              </span>
            </div>

            {/* Audit findings */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Website Gap Analysis
              </p>
              {auditCards.map((audit) => (
                <div
                  key={audit.title}
                  className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${audit.color}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <audit.icon size={14} className="shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold truncate">{audit.title}</p>
                      <p className="text-[10px] opacity-80 truncate">{audit.detail}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 shrink-0">
                    {audit.status}
                  </span>
                </div>
              ))}
            </div>

            {/* AI Pitch Draft Preview */}
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-2.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-700">AI Outreach Draft Ready</span>
                <CheckCircle size={12} className="text-emerald-600" />
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                "Hi Dr. Sharma, noticed your clinic is missing SSL security and mobile CTAs. Here is how we can fix it to book 30% more patients..."
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <div className="flex-1 h-8 rounded-lg bg-slate-900 text-white text-[11px] font-semibold flex items-center justify-center shadow-md">
                Copy WhatsApp
              </div>
              <div className="flex-1 h-8 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-[11px] font-semibold flex items-center justify-center shadow-md shadow-teal-500/30">
                Send 1-Click Email
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroMockup;
