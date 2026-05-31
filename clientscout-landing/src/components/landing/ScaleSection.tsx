import { Zap, Shield, CreditCard, Layout, Sparkles } from 'lucide-react';

const items = [
  { icon: Zap, text: 'Fast Maps search & instant imports' },
  { icon: Sparkles, text: 'AI analysis & website generation' },
  { icon: Shield, text: 'Secure auth & role-based access' },
  { icon: CreditCard, text: 'UPI payments — pay only for credits' },
  { icon: Layout, text: 'Built for freelancers & agencies' },
];

const ScaleSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
          Built to grow with your agency
        </h2>
        <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
          From your first local client to hundreds of leads in the pipeline — same workflow, more volume.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {items.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Icon size={22} />
              </div>
              <p className="font-semibold text-slate-800 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScaleSection;
