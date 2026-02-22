import { Activity, Users, DollarSign, Award } from 'lucide-react';

const stats = [
  { label: 'Active Users', value: '10k+', icon: <Users size={24} />, desc: 'Trusting us daily' },
  { label: 'Leads Generated', value: '5M+', icon: <Activity size={24} />, desc: 'High quality leads' },
  { label: 'Revenue Driven', value: '$500M+', icon: <DollarSign size={24} />, desc: 'For our clients' },
  { label: 'Global Reach', value: '150+', icon: <Award size={24} />, desc: 'Countries supported' },
];

const Stats = () => {
  return (
    <div className="py-20 bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-4xl lg:text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-white mb-1">{stat.label}</div>
              <div className="text-sm text-gray-400">{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
