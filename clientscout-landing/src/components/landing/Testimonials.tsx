import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    content: "ClientScout completely transformed our agency's lead generation process. We're closing 3x more deals now.",
    author: "Sarah Johnson",
    role: "CEO, Creative Agency",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    content: "The analytics are incredible. I can finally see exactly where my best leads are coming from.",
    author: "Michael Chen",
    role: "Marketing Director",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    content: "Simple, effective, and powerful. It paid for itself in the first week. Highly recommended!",
    author: "Emily Davis",
    role: "Freelance Consultant",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Trusted by Professionals</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            See what our customers have to say about their experience with ClientScout.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Quote className="absolute top-8 right-8 text-blue-100 h-12 w-12 -z-0" />
              <div className="flex gap-1 text-yellow-400 mb-6 relative z-10">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed relative z-10">"{testimonial.content}"</p>
              <div className="flex items-center gap-4 relative z-10 border-t border-gray-100 pt-6">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author} 
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{testimonial.author}</h4>
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
