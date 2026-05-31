import { Check, Globe, Layers, Palette, Share2, Sparkles } from 'lucide-react';

const steps = [
  { num: '01', title: 'Analyze the lead', desc: 'AI reviews their current site, pain points, and industry.' },
  { num: '02', title: 'Generate 2 layouts', desc: 'Corporate, creative, minimal, or store-style — tailored to the business.' },
  { num: '03', title: 'Customize in editor', desc: 'Swap templates, themes, colors, and section content live.' },
  { num: '04', title: 'Share & pitch', desc: 'Send a review link in email or WhatsApp — client picks a favorite.' },
];

const templates = ['Corporate', 'Creative', 'Minimal', 'E-commerce'];

const WebsiteGenerationSection = () => {
  return (
    <section id="website-generation" className="py-20 lg:py-28 section-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wide mb-6">
              <Sparkles size={14} />
              Website generation
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
              Show prospects their future website{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                before they hire you
              </span>
            </h2>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed">
              Stop pitching with words alone. ClientScout generates two branded website concepts from lead data and AI analysis —
              complete with hero, services, testimonials, and contact sections. Edit, share, and close faster.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                'Multiple templates: corporate, creative, minimal, e-commerce',
                'Light & dark themes with industry-appropriate styling',
                'Live preview + floating design editor',
                'Shareable client review links with approval flow',
                'Embed design preview button in outreach emails',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-300">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                    <Check size={12} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2">
              {templates.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-slate-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {steps.map((s) => (
                <div
                  key={s.num}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <span className="text-xs font-bold text-teal-400">{s.num}</span>
                  <h4 className="font-bold text-white mt-1 mb-1">{s.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-white">Design presentation</span>
                <div className="flex gap-2">
                  <span className="p-1.5 rounded-lg bg-white/10 text-teal-400" title="Templates">
                    <Layers size={16} />
                  </span>
                  <span className="p-1.5 rounded-lg bg-white/10 text-violet-400" title="Themes">
                    <Palette size={16} />
                  </span>
                  <span className="p-1.5 rounded-lg bg-white/10 text-blue-400" title="Share">
                    <Share2 size={16} />
                  </span>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-900">
                <div className="h-32 bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 p-4 flex flex-col justify-end">
                  <Globe className="text-white/40 mb-2" size={24} />
                  <p className="text-white font-bold text-lg">Acme Plumbing Co.</p>
                  <p className="text-teal-100/80 text-xs">Professional · Trusted · 24/7 Service</p>
                </div>
                <div className="p-3 grid grid-cols-3 gap-2">
                  {['Services', 'About', 'Contact'].map((sec) => (
                    <div key={sec} className="h-8 rounded bg-white/5 flex items-center justify-center text-[10px] text-slate-500">
                      {sec}
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500 text-center">
                Prospect opens your link → reviews both designs → approves their favorite
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WebsiteGenerationSection;
