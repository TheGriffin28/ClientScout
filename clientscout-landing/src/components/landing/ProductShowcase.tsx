import {
  MapPin,
  LayoutDashboard,
  BrainCircuit,
  Globe,
  Mail,
  MessageSquare,
  Link2,
  Bell,
  Palette,
  Share2,
} from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Google Maps discovery',
    description: 'Search by keyword and city. Auto-fetch phone, website, ratings, and emails from business sites.',
    accent: 'from-blue-500 to-cyan-500',
    span: 'lg:col-span-2',
  },
  {
    icon: Globe,
    title: 'AI website generation',
    description: 'Two custom layout concepts per lead — corporate, creative, minimal, or e-commerce templates with live preview.',
    accent: 'from-teal-500 to-emerald-500',
    span: 'lg:col-span-2',
    highlight: true,
  },
  {
    icon: BrainCircuit,
    title: 'AI lead analysis',
    description: 'Pain points, website issues, pitch angles, and personalized email & WhatsApp drafts.',
    accent: 'from-violet-500 to-purple-600',
    span: '',
  },
  {
    icon: Palette,
    title: 'Design editor',
    description: 'Tweak templates, themes, colors, and copy — then save and share with your prospect.',
    accent: 'from-pink-500 to-rose-500',
    span: '',
  },
  {
    icon: LayoutDashboard,
    title: 'Built-in CRM',
    description: 'Kanban pipeline, stages, notes, and full activity history for every lead.',
    accent: 'from-indigo-500 to-blue-600',
    span: '',
  },
  {
    icon: Share2,
    title: 'Client presentation links',
    description: 'Shareable URLs so prospects review and approve designs before you build.',
    accent: 'from-amber-500 to-orange-500',
    span: '',
  },
  {
    icon: Mail,
    title: 'Email outreach',
    description: 'One-click send with templates, variables, and optional design preview buttons in the email.',
    accent: 'from-sky-500 to-blue-500',
    span: '',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp outreach',
    description: 'AI drafts with design links — reach leads on the channel they actually use.',
    accent: 'from-green-500 to-emerald-600',
    span: '',
  },
  {
    icon: Link2,
    title: 'Website audit insights',
    description: 'SSL, speed, and trust signals surfaced automatically so you know what to pitch.',
    accent: 'from-slate-600 to-slate-800',
    span: '',
  },
  {
    icon: Bell,
    title: 'In-app notifications',
    description: 'Stay on top of lead updates and activity without leaving the dashboard.',
    accent: 'from-fuchsia-500 to-violet-600',
    span: '',
  },
];

const ProductShowcase = () => {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-teal-600 mb-3">Everything in one platform</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            More than lead scraping — a full client-winning toolkit
          </h2>
          <p className="text-lg text-slate-600">
            From the first Maps search to a shareable website mockup in your outreach email, ClientScout covers the entire freelance sales loop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {features.map((f) => (
            <article
              key={f.title}
              className={`group relative rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                f.highlight
                  ? 'border-teal-200 bg-gradient-to-br from-teal-50/80 to-emerald-50/50 lg:col-span-2'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
              } ${f.span}`}
            >
              {f.highlight && (
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-teal-600 text-white px-2 py-0.5 rounded-full">
                  New
                </span>
              )}
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center text-white mb-4 shadow-md`}
              >
                <f.icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
