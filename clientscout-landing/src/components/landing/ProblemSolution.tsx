import { X, Check } from 'lucide-react';

const ProblemSolution = () => {
  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <div className="bg-slate-50 p-8 md:p-10 rounded-3xl border border-red-100/80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/50 rounded-full blur-2xl -mr-8 -mt-8" />

              <p className="text-sm font-bold uppercase tracking-wider text-red-600 mb-3">The old way</p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 relative z-10">
                Winning local clients shouldn&apos;t take five different tools.
              </h2>

              <ul className="space-y-4 relative z-10">
                {[
                  'Hours of manual Google Maps searching',
                  'No emails — and no way to show what you could build',
                  'Generic pitches that don\'t mention their real website problems',
                  'Spreadsheets instead of a real CRM',
                  'Canva mockups created from scratch for every prospect',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-600">
                    <X className="text-red-500 h-5 w-5 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-teal-600 mb-3">With ClientScout</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-8">
              One platform from Maps search to{' '}
              <span className="text-gradient">shareable website pitch</span>
            </h2>

            <ul className="space-y-5">
              {[
                'Discover businesses on Google Maps with contact details',
                'AI analyzes their site and drafts your outreach',
                'Generate two website concepts — edit and share instantly',
                'CRM tracks every stage until they convert',
                'Credits only — no subscription trap',
              ].map((item) => (
                <li key={item} className="flex items-start gap-4">
                  <div className="mt-0.5 p-1 bg-teal-100 rounded-full shrink-0">
                    <Check className="text-teal-600 h-4 w-4" />
                  </div>
                  <span className="text-lg text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
