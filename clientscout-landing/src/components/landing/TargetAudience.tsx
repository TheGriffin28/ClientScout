import { Users, Monitor, PenTool, Search, Briefcase, Rocket } from 'lucide-react';

const TargetAudience = () => {
  const audience = [
    { icon: <Users />, label: "Freelancers" },
    { icon: <Monitor />, label: "Digital Marketing Agencies" },
    { icon: <PenTool />, label: "Web Designers" },
    { icon: <Search />, label: "SEO Consultants" },
    { icon: <Briefcase />, label: "Lead Generation Agencies" },
    { icon: <Rocket />, label: "Startup Founders" },
    { icon: <Users />, label: "Sales Teams" },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-12">
          ClientScout is perfect for:
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {audience.map((item, index) => (
            <div key={index} className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
              <div className="text-blue-600">{item.icon}</div>
              <span className="font-semibold text-gray-800">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudience;
