import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.1]">
              Find, Analyze & Convert Local Business Leads from <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Google Maps</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              ClientScout is an all-in-one lead discovery, CRM, and outreach platform built for freelancers and agencies to win local clients faster.
            </p>
            
            <p className="text-lg font-medium text-gray-500 mb-10">
              All-in-one lead discovery, CRM & outreach platform — no monthly lock-ins.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-6">
              <a href="https://app.clientscout.xyz/signup" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                Start Free Trial <ArrowRight size={20} />
              </a>
            </div>
            
            <p className="text-sm text-gray-500 font-medium flex items-center justify-center lg:justify-start gap-2 mb-12">
              <span className="flex items-center gap-1"><span className="text-green-500">✓</span> No credit card required</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>Cancel anytime</span>
            </p>
          </div>

          <div className="flex-1 w-full max-w-[600px] lg:max-w-none relative">
            <div className="relative rounded-2xl bg-gray-900 p-2 shadow-2xl animate-float">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-30"></div>
              <div className="relative rounded-xl overflow-hidden bg-gray-800 border border-gray-700 aspect-[4/3]">
                {/* Mock UI Dashboard - Google Maps Lead Discovery */}
                <div className="absolute inset-0 bg-gray-900 flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="h-6 w-64 bg-gray-800 rounded flex items-center px-2 text-xs text-gray-400 border border-gray-700">
                      <span className="text-blue-400 mr-2">🔍</span> Plumbers in Delhi
                    </div>
                  </div>
                  <div className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden">
                    {/* Sidebar */}
                    <div className="col-span-3 space-y-2 hidden sm:block">
                      <div className="h-8 bg-blue-600/20 border border-blue-600/30 rounded w-full"></div>
                      <div className="h-8 bg-gray-800 rounded w-full"></div>
                      <div className="h-8 bg-gray-800 rounded w-full"></div>
                      <div className="h-8 bg-gray-800 rounded w-full"></div>
                    </div>
                    {/* Main Content */}
                    <div className="col-span-12 sm:col-span-9 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 flex items-start gap-3">
                          <div className="w-10 h-10 rounded bg-gray-700 flex-shrink-0"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                            <div className="flex gap-2">
                              <div className="h-5 w-16 bg-green-500/20 rounded-full"></div>
                              <div className="h-5 w-16 bg-blue-500/20 rounded-full"></div>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">+</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          </div>
        </div>
      </div>
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-purple-100 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default Hero;
