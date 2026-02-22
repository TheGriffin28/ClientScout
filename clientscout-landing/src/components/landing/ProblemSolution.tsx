import { X, Check } from 'lucide-react';

const ProblemSolution = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Problem Section */}
          <div>
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-red-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-50 rounded-full blur-xl"></div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-8 relative z-10">
                Finding clients shouldn’t waste your entire day.
              </h2>
              
              <ul className="space-y-4 relative z-10">
                {[
                  "Manual Google Maps searching",
                  "No contact emails for businesses",
                  "No CRM to track follow-ups",
                  "Generic cold emails with low replies",
                  "Scattered tools and spreadsheets"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-600">
                    <div className="mt-1 min-w-5">
                      <X className="text-red-500 h-5 w-5" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Solution Section */}
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-8">
              ClientScout replaces 5 tools with <span className="text-blue-600">1 simple platform</span>
            </h2>
            
            <ul className="space-y-6">
              {[
                "Discover businesses directly from Google Maps",
                "Store and manage leads in a built-in CRM",
                "Use AI to analyze leads and generate outreach",
                "Track follow-ups, conversations, and conversions",
                "Pay only for what you use with credit-based pricing"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="mt-1 p-1 bg-green-100 rounded-full">
                    <Check className="text-green-600 h-4 w-4" />
                  </div>
                  <span className="text-lg text-gray-700 font-medium">{item}</span>
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
