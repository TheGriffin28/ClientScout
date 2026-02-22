import { Zap, Shield, Database, Layout, Clock } from 'lucide-react';

const ScaleSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
          Built to Scale as You Grow
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          ClientScout is designed to grow with you — from your first client to managing hundreds of leads.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {[
            { icon: <Zap size={24} />, text: "Fast & reliable platform" },
            { icon: <Shield size={24} />, text: "Secure authentication" },
            { icon: <Database size={24} />, text: "Usage-based limits (no abuse)" },
            { icon: <Layout size={24} />, text: "Stable performance at scale" },
            { icon: <Clock size={24} />, text: "Regular feature updates" }
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-3 p-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                {item.icon}
              </div>
              <p className="font-medium text-gray-900">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScaleSection;
