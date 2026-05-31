import { Search, Brain, Globe, Mail, Trophy } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Discover',
    description: 'Search Google Maps by niche and location. Import leads with one click.',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: Brain,
    title: 'Analyze',
    description: 'AI surfaces website issues, pain points, and a pitch angle tailored to each business.',
    color: 'text-violet-600 bg-violet-50',
  },
  {
    icon: Globe,
    title: 'Generate',
    description: 'Create two website mockups. Customize templates, themes, and copy in the design editor.',
    color: 'text-teal-600 bg-teal-50',
  },
  {
    icon: Mail,
    title: 'Outreach',
    description: 'Send personalized emails or WhatsApp messages — with design preview links built in.',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    icon: Trophy,
    title: 'Convert',
    description: 'Track stages in CRM, follow up, and turn cold leads into paying clients.',
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
            No more juggling Maps, spreadsheets, Canva, and Gmail. ClientScout connects every step.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-200 via-teal-200 to-emerald-200" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
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
