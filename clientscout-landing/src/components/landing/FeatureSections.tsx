import { Search, MapPin, Globe, Mail, MessageSquare, BrainCircuit, LayoutDashboard, Check } from 'lucide-react';

const FeatureDiscovery = () => {
  return (
    <div className="py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 order-2 lg:order-1">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-3xl transform rotate-3 scale-105 opacity-50"></div>
              <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl p-6">
                 {/* Mock Search UI */}
                 <div className="flex gap-2 mb-6">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-600 flex items-center gap-2">
                        <Search size={18} className="text-gray-400" />
                        Marketing agencies in London
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">Search</button>
                 </div>
                 <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900">Digital Growth Ltd</h4>
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">4.8 ★</span>
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                                <div className="flex items-center gap-2"><MapPin size={14} /> London, UK</div>
                                <div className="flex items-center gap-2"><Globe size={14} /> digitalgrowth.com</div>
                                <div className="flex items-center gap-2 text-blue-600"><Mail size={14} /> contact@digitalgrowth.com</div>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
          <div className="flex-1 order-1 lg:order-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide mb-4">
                Lead Discovery
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
              Discover high-intent leads from Google Maps
            </h2>
            <ul className="space-y-4 mb-8">
              {[
                "Search businesses by keyword & location",
                "Auto-fetch business name, phone, address, website & rating",
                "Intelligent email discovery from business websites",
                "One-click import into CRM"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Check size={14} />
                    </div>
                    {item}
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Example Searches:</p>
                <div className="flex flex-wrap gap-2">
                    {["Plumbers in New York", "Dental clinics in Mumbai", "Marketing agencies in London"].map((tag, i) => (
                        <span key={i} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-600">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCRM = () => {
    return (
      <div className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide mb-4">
                  CRM & Management
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                Organize and track every lead in one place
              </h2>
              <ul className="space-y-4 mb-8">
                {[
                  "Visual Lead Dashboard with Kanban & List views",
                  "Track Lead Stages: New, Contacted, Follow-Up, Interested, Converted, Lost",
                  "Add/edit leads manually or from Maps",
                  "Full lead history, notes & activity logs"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                      <div className="mt-1 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                          <LayoutDashboard size={14} />
                      </div>
                      {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 relative">
                    {/* Mock Kanban Board */}
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {["New Leads", "Contacted", "Interested"].map((col, i) => (
                            <div key={i} className="w-48 flex-shrink-0 bg-gray-50 rounded-lg p-3">
                                <div className="text-xs font-bold text-gray-500 uppercase mb-3 flex justify-between">
                                    {col} <span className="bg-gray-200 px-1.5 rounded text-gray-600">{2 + i}</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="bg-white p-3 rounded shadow-sm border border-gray-100 text-sm">
                                        <div className="font-medium text-gray-900 mb-1">Acme Corp</div>
                                        <div className="text-xs text-gray-500">Last activity: 2d ago</div>
                                    </div>
                                    <div className="bg-white p-3 rounded shadow-sm border border-gray-100 text-sm">
                                        <div className="font-medium text-gray-900 mb-1">Stark Ind</div>
                                        <div className="text-xs text-gray-500">Last activity: 5h ago</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FeatureAI = () => {
    return (
      <div className="py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 order-2 lg:order-1">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BrainCircuit size={120} />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                                <BrainCircuit size={16} />
                            </div>
                            <span className="font-semibold text-purple-200">AI Analysis Result</span>
                        </div>
                        <div className="space-y-4 text-sm text-gray-300">
                            <div className="bg-white/10 p-4 rounded-lg">
                                <p className="font-semibold text-white mb-1">Pain Points Identified:</p>
                                <p>Slow website load speed, outdated copyright (2021), no SSL certificate.</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-lg">
                                <p className="font-semibold text-white mb-1">Suggested Pitch Angle:</p>
                                <p>"Help them secure their site and improve conversions with a modern redesign."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1 order-1 lg:order-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wide mb-4">
                  AI Intelligence
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                Know exactly how to pitch each lead
              </h2>
              <ul className="space-y-4 mb-8">
                {[
                  "Analyze business pain points",
                  "Website performance & trust observations",
                  "Conversion improvement suggestions",
                  "AI-generated lead summary",
                  "Personalized email & WhatsApp drafts"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <BrainCircuit size={14} />
                      </div>
                      {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 text-purple-600 font-medium bg-purple-50 px-4 py-2 rounded-lg inline-block">
                <span className="text-xl">💡</span> No more guessing what to say.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FeatureOutreach = () => {
    return (
      <div className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wide mb-4">
                  Outreach
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                Reach leads faster with built-in outreach
              </h2>
              <ul className="space-y-4 mb-8">
                {[
                  "Email & WhatsApp outreach integration",
                  "AI-generated personalized drafts",
                  "Reusable message templates with dynamic variables",
                  "One-click actions: Email, WhatsApp, Phone Dialer",
                  "Automatic activity logging"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <MessageSquare size={14} />
                      </div>
                      {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 text-sm text-gray-500 font-mono bg-white border border-gray-200 p-3 rounded-lg max-w-md">
                 <span>Variable support:</span>
                 <span className="bg-gray-100 px-1 rounded text-gray-700">{"{{BusinessName}}"}</span>
                 <span className="bg-gray-100 px-1 rounded text-gray-700">{"{{ContactName}}"}</span>
              </div>
            </div>
            <div className="flex-1">
                 {/* Mock Email Composer */}
                 <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6">
                    <div className="border-b border-gray-100 pb-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-gray-900">New Message</span>
                            <div className="flex gap-2">
                                <button className="p-1.5 bg-green-100 text-green-700 rounded"><MessageSquare size={16} /></button>
                                <button className="p-1.5 bg-blue-100 text-blue-700 rounded"><Mail size={16} /></button>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">To: <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">John Doe</span></div>
                    </div>
                    <div className="space-y-3">
                        <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            Hi {"{{ContactName}}"},<br/><br/>
                            I noticed that {"{{BusinessName}}"} has some great reviews on Google Maps, but your website seems to be down...
                        </div>
                        <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">Send Email</button>
                    </div>
                 </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export { FeatureDiscovery, FeatureCRM, FeatureAI, FeatureOutreach };
