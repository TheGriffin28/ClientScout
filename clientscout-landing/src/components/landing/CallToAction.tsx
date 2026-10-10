import { ArrowRight } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-20 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950" />
      <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-600/20 to-transparent" />

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          Ready to find leads and pitch with real website mockups?
        </h2>
        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
          Join freelancers and agencies using ClientScout to discover, analyze, design, and close local business clients faster.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-400 mb-10 text-sm">
          <span>No credit card required</span>
          <span className="hidden sm:inline">·</span>
          <span>Free trial credits</span>
          <span className="hidden sm:inline">·</span>
          <span>Cancel anytime</span>
        </div>

        <a
          href="https://app.clientscout.xyz/signup"
          className="inline-flex items-center gap-2 px-10 py-4 bg-white text-slate-900 hover:bg-teal-50 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
        >
          Start free trial
          <ArrowRight size={22} />
        </a>
      </div>
    </section>
  );
};

export default CallToAction;
