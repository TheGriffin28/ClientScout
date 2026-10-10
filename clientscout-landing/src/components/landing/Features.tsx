import { BarChart3, MapPin, ShieldCheck, Users2, Zap, Target, ArrowUpRight } from 'lucide-react';

const features = [
  {
    icon: <Users2 className="h-6 w-6 text-white" />,
    color: "bg-blue-500",
    title: 'Lead Management',
    description: 'Centralize your leads with our intuitive CRM. Track status, notes, and follow-ups in one place.',
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-white" />,
    color: "bg-indigo-500",
    title: 'Advanced Analytics',
    description: 'Get deep insights into your pipeline performance. Visualize growth and identify bottlenecks.',
  },
  {
    icon: <MapPin className="h-6 w-6 text-white" />,
    color: "bg-purple-500",
    title: 'Global Reach',
    description: 'Scout clients worldwide. Filter by region, country, and industry to find the perfect match.',
  },
  {
    icon: <Target className="h-6 w-6 text-white" />,
    color: "bg-rose-500",
    title: 'Smart Scoring',
    description: 'AI-driven lead scoring helps you prioritize prospects with the highest conversion potential.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-white" />,
    color: "bg-emerald-500",
    title: 'Secure & Private',
    description: 'Your data is encrypted and protected. We prioritize your privacy and business security.',
  },
  {
    icon: <Zap className="h-6 w-6 text-white" />,
    color: "bg-amber-500",
    title: 'Instant Alerts',
    description: 'Never miss an opportunity. Get real-time notifications for new leads and status changes.',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">Features</h2>
          <p className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Everything you need to grow
          </p>
          <p className="text-xl text-gray-500">
            Powerful tools designed to streamline your client acquisition process and boost your revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group relative p-8 bg-white rounded-3xl border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300">
              <div className={`absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                <ArrowUpRight className="text-gray-300 group-hover:text-blue-600" />
              </div>
              <div className={`inline-flex items-center justify-center p-3 rounded-2xl ${feature.color} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
