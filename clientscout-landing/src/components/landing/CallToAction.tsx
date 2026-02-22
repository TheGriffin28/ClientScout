import { ArrowRight } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-blue-600">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      
      <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          Start Finding Clients Today
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-100 mb-10 text-lg">
           <span>No credit card required.</span>
           <span className="hidden sm:inline">•</span>
           <span>Cancel anytime.</span>
        </div>
        
        <div className="flex justify-center">
          <a href="https://app.clientscout.xyz/signup" className="px-10 py-5 bg-white text-blue-600 hover:bg-gray-50 rounded-full font-bold text-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
            Start Free Trial <ArrowRight size={24} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
