import { CheckCircle2 } from 'lucide-react';

const features = [
  "Built for Freelancers & Agencies",
  "Google Maps Lead Discovery",
  "AI-Powered Lead Insights",
  "Secure UPI Payments",
  "No Monthly Lock-in"
];

const TrustStrip = () => {
  return (
    <div className="bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-600 font-medium">
              <CheckCircle2 className="text-blue-600 h-5 w-5" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustStrip;
