import { Search, Brain, Mail, Trophy } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Discover',
    description: 'Search Google Maps by niche and location. Import high-potential leads with one click.',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: Brain,
    title: 'Audit & Analyze',
    description: 'AI audits website speed, trust signals, and conversion flaws with actionable pitch points.',
    color: 'text-violet-600 bg-violet-50',
  },
  {
    icon: Mail,
    title: 'Outreach',
    description: 'Send personalized emails and WhatsApp messages tailored to their exact website weaknesses.',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    icon: Trophy,
    title: 'Convert',
    description: 'Track follow-ups, maintain CRM notes, and turn cold prospects into high-paying clients.',
    color: 'text-emerald-600 bg-emerald-50',
  },
];

const WorkflowSection = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-24 bg-slate-50 border-y border-slate-100 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            One workflow, end to end
          </h2>
          <p className="text-lg text-slate-600">
            No more juggling Maps, spreadsheets, and Gmail. ClientScout connects every step seamlessly.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                <div
                  className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${step.color}`}
                >
                  <step.icon size={26} />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
