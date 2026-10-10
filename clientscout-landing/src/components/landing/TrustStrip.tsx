import { CheckCircle2 } from 'lucide-react';

const features = [
  'Google Maps lead discovery',
  'AI website mockups per lead',
  'Built-in CRM & outreach',
  'Pay-as-you-go credits',
  'No monthly lock-in',
];

const TrustStrip = () => {
  return (
    <div className="bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 md:gap-x-10">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
              <CheckCircle2 className="text-teal-600 h-4 w-4 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustStrip;
