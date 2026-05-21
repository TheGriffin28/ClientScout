
import React, { useState } from "react";
import { Lead } from "../../services/leadService";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaCheckCircle,
  FaStar,
  FaArrowRight,
  FaUserGraduate,
  FaTrophy,
  FaBook,
  FaGraduationCap,
} from "react-icons/fa";
import { getImageMood, RELIABLE_FALLBACKS } from "../../services/imageSystem";

interface WebsitePreviewProps {
  layout: Lead["generatedLayout"];
  businessName: string;
  industry?: string;
  businessType?: string;
}

const templateStyles: Record<
  string,
  {
    topBar: string;
    navbar: string;
    heroButton: string;
    heroButtonSecondary: string;
    featuresBar: string;
    aboutSection: string;
    aboutIcon: string;
    servicesCardButton: string;
    testimonialsStar: string;
    ctaSection: string;
    footer: string;
  }
> = {
  "modern-business": {
    topBar: "bg-gray-900 text-white",
    navbar: "bg-white shadow-md",
    heroButton: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xl",
    heroButtonSecondary: "bg-gradient-to-r from-amber-500 to-orange-500 text-gray-900 hover:from-amber-600 hover:to-orange-600 shadow-xl",
    featuresBar: "bg-gray-900 text-white",
    aboutSection: "bg-gray-50",
    aboutIcon: "bg-amber-100 text-amber-600",
    servicesCardButton: "text-amber-600 hover:text-amber-700",
    testimonialsStar: "text-amber-400",
    ctaSection: "bg-gradient-to-r from-blue-600 to-indigo-700",
    footer: "bg-gray-900 text-white",
  },
  "premium-dark": {
    topBar: "bg-black text-white",
    navbar: "bg-gray-900 shadow-md border-b border-gray-800",
    heroButton: "bg-gradient-to-r from-amber-500 to-orange-500 text-gray-900 hover:from-amber-600 hover:to-orange-600 shadow-xl",
    heroButtonSecondary: "border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-gray-900",
    featuresBar: "bg-gradient-to-r from-gray-900 to-black text-white",
    aboutSection: "bg-gray-900",
    aboutIcon: "bg-amber-500/20 text-amber-400",
    servicesCardButton: "text-amber-400 hover:text-amber-300",
    testimonialsStar: "text-amber-400",
    ctaSection: "bg-gradient-to-r from-gray-900 to-black",
    footer: "bg-black text-white",
  },
  "local-bright": {
    topBar: "bg-orange-600 text-white",
    navbar: "bg-white shadow-md",
    heroButton: "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-xl",
    heroButtonSecondary: "bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 hover:from-yellow-600 hover:to-amber-600 shadow-xl",
    featuresBar: "bg-orange-600 text-white",
    aboutSection: "bg-orange-50",
    aboutIcon: "bg-orange-100 text-orange-600",
    servicesCardButton: "text-orange-600 hover:text-orange-700",
    testimonialsStar: "text-orange-400",
    ctaSection: "bg-gradient-to-r from-orange-600 to-red-600",
    footer: "bg-gray-900 text-white",
  },
  "minimal-fast": {
    topBar: "bg-gray-100 text-gray-900",
    navbar: "bg-white shadow-sm border-b border-gray-200",
    heroButton: "bg-gray-900 text-white hover:bg-black shadow-lg",
    heroButtonSecondary: "border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white",
    featuresBar: "bg-gray-800 text-white",
    aboutSection: "bg-gray-50",
    aboutIcon: "bg-gray-200 text-gray-700",
    servicesCardButton: "text-gray-700 hover:text-gray-900",
    testimonialsStar: "text-gray-500",
    ctaSection: "bg-gray-900",
    footer: "bg-gray-900 text-white",
  },
};

const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  layout,
  businessName,
  industry,
  businessType,
}) => {
  if (!layout) return null;

  const { hero, about, services, contact } = layout.content;
  const imageMood = getImageMood(industry, businessType);
  const [heroImageError, setHeroImageError] = useState(false);
  const [aboutImageError, setAboutImageError] = useState(false);
  const [serviceImageErrors, setServiceImageErrors] = useState<Record<number, boolean>>({});
  const [galleryImageErrors, setGalleryImageErrors] = useState<Record<number, boolean>>({});
  const template = templateStyles[layout.templateKey] || templateStyles["modern-business"];
  const isDark = layout.templateKey === "premium-dark";

  const heroImageUrl = heroImageError ? RELIABLE_FALLBACKS.hero : imageMood.stockImages.hero;
  const aboutImageUrl = aboutImageError ? RELIABLE_FALLBACKS.about : imageMood.stockImages.about;

  const getServiceImageUrl = (index: number) => {
    if (serviceImageErrors[index]) {
      const fallbacks = [RELIABLE_FALLBACKS.service1, RELIABLE_FALLBACKS.service2, RELIABLE_FALLBACKS.service3, RELIABLE_FALLBACKS.service4];
      return fallbacks[index % fallbacks.length];
    }
    return imageMood.stockImages.services[index % imageMood.stockImages.services.length];
  };

  const getGalleryImageUrl = (index: number) => {
    if (galleryImageErrors[index]) {
      const fallbacks = [RELIABLE_FALLBACKS.gallery1, RELIABLE_FALLBACKS.gallery2, RELIABLE_FALLBACKS.gallery3, RELIABLE_FALLBACKS.gallery4];
      return fallbacks[index % fallbacks.length];
    }
    return imageMood.stockImages.gallery[index % imageMood.stockImages.gallery.length];
  };

  return (
    <div className={`font-sans ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 ${template.navbar} backdrop-blur-xl bg-opacity-90`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
          <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {businessName}
          </div>
          <div className={`hidden md:flex items-center gap-10 font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            <a href="#" className={`${isDark ? "hover:text-white" : "hover:text-gray-900"} transition-colors`}>Home</a>
            <a href="#" className={`${isDark ? "hover:text-white" : "hover:text-gray-900"} transition-colors`}>About Us</a>
            <a href="#" className={`${isDark ? "hover:text-white" : "hover:text-gray-900"} transition-colors`}>Programs</a>
            <a href="#" className={`${isDark ? "hover:text-white" : "hover:text-gray-900"} transition-colors`}>Success Stories</a>
            <a href="#" className={`${isDark ? "hover:text-white" : "hover:text-gray-900"} transition-colors`}>Contact</a>
          </div>
          <button className={`${template.heroButton} px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-xl`}>
            {hero.primaryCta}
          </button>
        </div>
      </nav>

      {/* Hero Section - Asymmetric Cinematic */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImageUrl}
            alt={businessName}
            className="w-full h-full object-cover scale-105"
            loading="lazy"
            onError={() => setHeroImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-900/40"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 h-[650px] md:h-[700px] flex items-center py-16 md:py-20">
          <div className="max-w-3xl text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full mb-4">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              <span className="text-orange-300 text-xs font-semibold">Excellence in Education Since 2014</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-snug mb-4">
              {hero.headline}
            </h1>
            <p className="text-base md:text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl">
              {hero.tagline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button className={`${template.heroButtonSecondary} px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-xl hover:shadow-orange-500/30`}>
                {hero.primaryCta}
              </button>
              <button className="backdrop-blur-sm border border-white/30 text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-white/10 transition-all">
                {hero.secondaryCta}
              </button>
            </div>
            <div className="flex items-center gap-6 pt-5 border-t border-white/10">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-950 overflow-hidden bg-slate-800">
                    <img 
                      src={`https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=closeup portrait of a smiling indian student headshot&image_size=square`} 
                      alt={`Student ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-lg font-bold text-white">500+ Students</p>
                <p className="text-slate-400">Selected in Top Colleges</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Stats with Glow */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-orange-50/50"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-100/60 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-100/60 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-6">Our Impact</span>
            <h2 className={`text-4xl md:text-5xl font-black mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Numbers That Speak</h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-gray-300" : "text-slate-600"}`}>Real results from real students who trusted us with their dreams</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Selections", value: "500+", icon: <FaUserGraduate />, color: "from-orange-500 to-amber-500" },
              { label: "Years", value: "10+", icon: <FaTrophy />, color: "from-blue-500 to-indigo-500" },
              { label: "Programs", value: "15+", icon: <FaBook />, color: "from-emerald-500 to-teal-500" },
              { label: "Success Rate", value: "95%", icon: <FaGraduationCap />, color: "from-purple-500 to-pink-500" }
            ].map((counter, index) => (
              <div 
                key={index} 
                className="group relative p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${counter.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${counter.color} rounded-full opacity-10 group-hover:opacity-20 transition-all duration-500`}></div>
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${counter.color} flex items-center justify-center text-white text-2xl mb-6 shadow-lg`}>
                  {counter.icon}
                </div>
                <p className={`text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r ${counter.color} bg-clip-text text-transparent`}>
                  {counter.value}
                </p>
                <p className={`text-lg font-semibold ${isDark ? "text-gray-200" : "text-slate-700"}`}>
                  {counter.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className={`py-24 ${template.aboutSection} relative overflow-hidden`}>
        <div className="absolute top-1/2 -translate-y-1/2 -left-40 w-80 h-80 bg-orange-200/40 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-full h-full border-4 border-orange-200 rounded-3xl -z-10"></div>
              <img
                src={aboutImageUrl}
                alt={`About ${businessName}`}
                className="w-full h-[600px] object-cover rounded-3xl shadow-2xl"
                loading="lazy"
                onError={() => setAboutImageError(true)}
              />
              <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-2xl shadow-2xl">
                <p className="text-4xl font-black text-orange-600">10+</p>
                <p className="text-slate-700 font-semibold">Years of Excellence</p>
              </div>
            </div>
            <div>
              <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-6">About Us</span>
              <h2 className={`text-4xl md:text-5xl font-black mb-8 ${isDark ? "text-white" : "text-slate-900"}`}>
                {about.title}
              </h2>
              <p className={`text-lg leading-relaxed mb-10 ${isDark ? "text-gray-300" : "text-slate-600"}`}>
                {about.description}
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${template.aboutIcon}`}>
                    <FaCheckCircle size={24} />
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>Expert Faculty</p>
                    <p className={isDark ? "text-gray-400" : "text-slate-500"}>IIT & IIM graduates with 10+ years experience</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${template.aboutIcon}`}>
                    <FaCheckCircle size={24} />
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>Personalized Learning</p>
                    <p className={isDark ? "text-gray-400" : "text-slate-500"}>Custom study plans for every student</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${template.aboutIcon}`}>
                    <FaCheckCircle size={24} />
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>Proven Results</p>
                    <p className={isDark ? "text-gray-400" : "text-slate-500"}>95% success rate year after year</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wow Moment - Quote Section */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 text-center">
          <div className="text-9xl font-black text-orange-500 opacity-30 mb-8">"</div>
          <blockquote className="text-3xl md:text-5xl font-bold text-white leading-relaxed mb-10">
            Education is the most powerful weapon which you can use to change the world.
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-2xl text-white font-bold">
              N
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-white">Nelson Mandela</p>
              <p className="text-orange-400">Inspiration for Every Student</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Staggered Cards */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-white"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-6">Our Programs</span>
            <h2 className={`text-4xl md:text-5xl font-black mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>What We Offer</h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-gray-300" : "text-slate-600"}`}>Comprehensive programs designed to unlock every student's potential</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className={`group ${isDark ? "bg-gray-900 border border-gray-800" : "bg-white"} rounded-3xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-4 ${index % 3 === 1 ? 'lg:mt-12' : ''}`}
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={getServiceImageUrl(index)}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    onError={() => setServiceImageErrors(prev => ({ ...prev, [index]: true }))}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  <div className="absolute bottom-6 left-6">
                    <span className="inline-block px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                    {service.name}
                  </h3>
                  <p className={`leading-relaxed mb-8 ${isDark ? "text-gray-300" : "text-slate-600"}`}>
                    {service.description}
                  </p>
                  <button className={`flex items-center gap-3 font-bold text-lg ${template.servicesCardButton} group-hover:gap-5 transition-all`}>
                    Explore Program <FaArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Humanized with Profiles */}
      <section className={`py-24 ${template.aboutSection} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-6">Success Stories</span>
            <h2 className={`text-4xl md:text-5xl font-black mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              What Our Students Say
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-gray-300" : "text-slate-600"}`}>
              Real experiences from students who achieved their dreams
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Rahul Sharma",
                role: "NEET Student • Pune",
                quote: "The teachers here are incredible! They didn't just teach me concepts, they taught me how to think. Got into my dream medical college!",
                rating: 5,
                image: "smiling indian male student headshot"
              },
              {
                name: "Priya Patel",
                role: "JEE Aspirant • Mumbai",
                quote: "Personal attention made all the difference. The study materials were perfectly structured. I can't thank them enough!",
                rating: 5,
                image: "smiling indian female student headshot"
              },
              {
                name: "Amit Singh",
                role: "Foundation Student • Delhi",
                quote: "Started from the bottom, now here! The foundation program built my concepts so strong that everything became easy later.",
                rating: 5,
                image: "young indian student boy smiling portrait"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className={`${isDark ? "bg-gray-900 border border-gray-800" : "bg-white"} p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${index === 1 ? 'lg:mt-12' : ''}`}
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className={template.testimonialsStar} size={22} />
                  ))}
                </div>
                <p className={`text-lg leading-relaxed mb-8 italic ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-5 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-r from-orange-400 to-amber-500 flex-shrink-0">
                    <img
                      src={`https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(testimonial.image)}&image_size=square`}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                      {testimonial.name}
                    </p>
                    <p className={isDark ? "text-gray-400" : "text-orange-600 font-medium"}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery - Curated */}
      <section className="py-24 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-6">Our Campus</span>
            <h2 className={`text-4xl md:text-5xl font-black mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Inside Our Institute
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {imageMood.stockImages.gallery.slice(0, 8).map((_, index) => (
              <div key={index} className={`overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${index === 0 || index === 5 ? 'lg:col-span-2 lg:row-span-2' : ''}`}>
                <img
                  src={getGalleryImageUrl(index)}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  style={{ minHeight: index === 0 || index === 5 ? '400px' : '190px' }}
                  loading="lazy"
                  onError={() => setGalleryImageErrors(prev => ({ ...prev, [index]: true }))}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className={`py-32 ${template.ctaSection} relative overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-8">
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-white/20 text-white rounded-full text-sm font-bold mb-8">Ready to Start?</span>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
              Your Journey Starts Here
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
              Join hundreds of successful students who trusted us with their future. Let's make your dreams a reality together.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="bg-white text-slate-900 px-12 py-6 rounded-2xl font-bold text-xl hover:bg-orange-50 transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-1">
                {contact.ctaText}
              </button>
              <button className="border-2 border-white text-white px-12 py-6 rounded-2xl font-bold text-xl hover:bg-white hover:text-slate-900 transition-all">
                Book a Free Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Premium */}
      <footer className={`${template.footer} py-24 relative overflow-hidden`}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
            <div className="lg:col-span-2">
              <h3 className="text-3xl font-black mb-6">{businessName}</h3>
              <p className="text-gray-400 leading-relaxed mb-8 text-lg">
                Empowering the next generation of leaders through quality education and personalized mentoring.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-white hover:bg-orange-600 transition-colors">
                  <FaFacebook size={20} />
                </a>
                <a href="#" className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-white hover:bg-orange-600 transition-colors">
                  <FaInstagram size={20} />
                </a>
                <a href="#" className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-white hover:bg-orange-600 transition-colors">
                  <FaTwitter size={20} />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors text-lg">Home</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors text-lg">About Us</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors text-lg">Programs</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors text-lg">Success Stories</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors text-lg">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Programs</h4>
              <ul className="space-y-4 text-gray-400">
                {services.slice(0, 4).map((service, index) => (
                  <li key={index}><a href="#" className="hover:text-orange-400 transition-colors text-lg">{service.name}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Newsletter</h4>
              <p className="text-gray-400 mb-6">Get the latest updates and study tips delivered to your inbox.</p>
              <div className="flex gap-3">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-1 px-5 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />
                <button className="px-6 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:from-orange-600 hover:to-amber-600 transition-all">
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-gray-400 text-lg">© 2026 {businessName}. All Rights Reserved.</p>
            <div className="flex gap-8 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebsitePreview;

