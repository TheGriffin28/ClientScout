import React, { useState } from "react";
import { Lead, LayoutVersion } from "../../services/leadService";
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
import { getTemplate, getTheme, ThemeKey } from "../../services/templateEngine";

function hexWithAlpha(hex: string, alpha: number): string {
  const hexWithoutHash = hex.replace('#', '');
  const r = parseInt(hexWithoutHash.substring(0, 2), 16);
  const g = parseInt(hexWithoutHash.substring(2, 4), 16);
  const b = parseInt(hexWithoutHash.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface WebsitePreviewProps {
  layout: Lead["generatedLayout"] | LayoutVersion;
  businessName: string;
  industry?: string;
  businessType?: string;
}


interface Service {
  name: string;
  description: string;
}

interface Testimonial {
  name: string;
  quote: string;
}

const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  layout,
  businessName,
  industry,
  businessType,
}) => {
  if (!layout) return null;

  // Ensure all content sections exist with defaults
  const ensureContent = (content: any) => ({
    hero: content?.hero || {
      headline: `${businessName} — Your Trusted Partner`,
      tagline: "Professional services tailored to your needs",
      primaryCta: "Get Started",
      secondaryCta: "Learn More",
    },
    about: content?.about || {
      title: `About ${businessName}`,
      description: "With years of experience serving our community, we are dedicated to providing exceptional services that exceed expectations. Our team of professionals is committed to helping you achieve your goals.",
    },
    services: content?.services && content.services.length ? content.services as Service[] : [
      { name: "Consulting Services", description: "Expert advice to help your business thrive." },
      { name: "Premium Support", description: "Dedicated assistance when you need it most." },
      { name: "Custom Solutions", description: "Tailored services to meet your unique needs." },
    ],
    testimonials: content?.testimonials && content.testimonials.length ? content.testimonials as Testimonial[] : [
      { name: "Sarah M.", quote: "Working with this team has been absolutely fantastic. They truly care about their clients and deliver exceptional results." },
      { name: "Michael T.", quote: "Professional, reliable, and results-driven. I couldn't recommend them more highly for anyone looking to grow their business." },
    ],
    contact: content?.contact || {
      phone: "",
      address: "",
      ctaText: "Contact Us",
    },
    gallery: content?.gallery || [],
  });
  
  const safeContent = ensureContent(layout.content);
  const { hero, about, services, contact } = safeContent;
  const imageMood = getImageMood(industry, businessType);
  const [heroImageError, setHeroImageError] = useState(false);
  const [aboutImageError, setAboutImageError] = useState(false);
  const [serviceImageErrors, setServiceImageErrors] = useState<Record<number, boolean>>({});
  const [galleryImageErrors, setGalleryImageErrors] = useState<Record<number, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const themeKey = (layout.themeKey || "light") as ThemeKey;
  const theme = getTheme(themeKey);
  const previewRootStyle: React.CSSProperties = {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontFamily: theme.fonts?.body,
  } as React.CSSProperties;

  const legacyToStructuralMap: Record<string, "corporate" | "creative" | "minimal" | "ecommerce"> = {
    "modern-business": "corporate",
    "premium-dark": "creative",
    "local-bright": "minimal",
    "minimal-fast": "minimal",
    "ecommerce-store": "ecommerce",
  };

  const structuralKey = legacyToStructuralMap[layout.templateKey] || "corporate";
  const structure = getTemplate(structuralKey);

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

  const renderNavbar = () => (
    <nav className="sticky top-0 z-50 shadow-md backdrop-blur-xl" style={{ backgroundColor: hexWithAlpha(theme.colors.surface, 0.9) }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        <div className="text-2xl font-bold" style={{ color: theme.colors.text }}>
          {businessName}
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10 font-medium" style={{ color: theme.colors.text }}>
          <a href="#" className="hover:opacity-80 transition-opacity">Home</a>
          <a href="#" className="hover:opacity-80 transition-opacity">About Us</a>
          <a href="#" className="hover:opacity-80 transition-opacity">Programs</a>
          <a href="#" className="hover:opacity-80 transition-opacity">Success Stories</a>
          <a href="#" className="hover:opacity-80 transition-opacity">Contact</a>
        </div>
        
        {/* Desktop CTA */}
        <div className="hidden md:block">
          <button
            className="px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-xl"
            style={{ backgroundColor: theme.colors.accent, color: theme.colors.surface }}
          >
            {hero.primaryCta}
          </button>
        </div>
        
        {/* Mobile Hamburger Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: theme.colors.text }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t" style={{ borderColor: hexWithAlpha(theme.colors.text, 0.1) }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-4">
            <a href="#" className="block py-3 font-medium" style={{ color: theme.colors.text }} onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#" className="block py-3 font-medium" style={{ color: theme.colors.text }} onClick={() => setMobileMenuOpen(false)}>About Us</a>
            <a href="#" className="block py-3 font-medium" style={{ color: theme.colors.text }} onClick={() => setMobileMenuOpen(false)}>Programs</a>
            <a href="#" className="block py-3 font-medium" style={{ color: theme.colors.text }} onClick={() => setMobileMenuOpen(false)}>Success Stories</a>
            <a href="#" className="block py-3 font-medium" style={{ color: theme.colors.text }} onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <button
              className="w-full py-3 rounded-lg font-semibold transition-all"
              style={{ backgroundColor: theme.colors.accent, color: theme.colors.surface }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {hero.primaryCta}
            </button>
          </div>
        </div>
      )}
    </nav>
  );

  const renderHeroLeftRight = () => (
    !hero ? null : (
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: theme.colors.surface }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.125), color: theme.colors.accent }}>
                Welcome to {businessName}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-snug mb-4" style={{ color: theme.colors.text, fontFamily: theme.fonts?.heading }}>
                {hero.headline}
              </h1>
              <p className="text-lg leading-relaxed mb-8" style={{ color: hexWithAlpha(theme.colors.text, 0.6) }}>
                {hero.tagline}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg"
                  style={{ backgroundColor: theme.colors.accent, color: theme.colors.surface }}
                >
                  {hero.primaryCta}
                </button>
                <button
                  className="border px-8 py-3.5 rounded-xl font-bold transition-all"
                  style={{ borderColor: theme.colors.text, color: theme.colors.text }}
                >
                  {hero.secondaryCta}
                </button>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="absolute -top-6 -right-6 w-full h-full rounded-3xl -z-10" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.125) }}></div>
              <img
                src={heroImageUrl}
                alt={businessName}
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
                loading="lazy"
                onError={() => setHeroImageError(true)}
              />
            </div>
          </div>
        </div>
      </section>
    )
  );

  const renderHeroLargeVisual = () => (
    !hero ? null : (
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImageUrl}
            alt={businessName}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setHeroImageError(true)}
          />
          <div className="absolute inset-0" style={{ backgroundColor: hexWithAlpha(theme.colors.background, 0.87) }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 h-[750px] flex items-center justify-center py-20">
          <div className="text-center max-w-4xl" style={{ color: theme.colors.text }}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6" style={{ fontFamily: theme.fonts?.heading }}>
              {hero.headline}
            </h1>
            <p className="text-xl md:text-2xl mb-10" style={{ color: hexWithAlpha(theme.colors.text, 0.8) }}>
              {hero.tagline}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                className="px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.surface }}
              >
                {hero.primaryCta}
              </button>
              <button
                className="border-2 px-10 py-4 rounded-2xl font-bold text-lg transition-all"
                style={{ borderColor: theme.colors.text, color: theme.colors.text }}
              >
                {hero.secondaryCta}
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  );

  const renderHeroCentered = () => (
    !hero ? null : (
      <section className="py-24 text-center relative overflow-hidden" style={{ backgroundColor: theme.colors.surface }}>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-snug mb-6" style={{ color: theme.colors.text, fontFamily: theme.fonts?.heading }}>
            {hero.headline}
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto" style={{ color: hexWithAlpha(theme.colors.text, 0.6) }}>
            {hero.tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              className="px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg"
              style={{ backgroundColor: theme.colors.accent, color: theme.colors.surface }}
            >
              {hero.primaryCta}
            </button>
            <button
              className="border px-8 py-3.5 rounded-xl font-bold transition-all"
              style={{ borderColor: theme.colors.text, color: theme.colors.text }}
            >
              {hero.secondaryCta}
            </button>
          </div>
          <div className="relative">
            <img
              src={heroImageUrl}
              alt={businessName}
              className="w-full h-[400px] object-cover rounded-3xl shadow-2xl mx-auto"
              loading="lazy"
              onError={() => setHeroImageError(true)}
            />
          </div>
        </div>
      </section>
    )
  );

  const renderHero = () => {
    if (!hero) return null;
    const heroVariant = structure.heroVariant[0];
    if (heroVariant === "left-image") return renderHeroLeftRight();
    if (heroVariant === "large-visual") return renderHeroLargeVisual();
    return renderHeroCentered();
  };

  const renderStats = () => (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: theme.colors.surface }}>
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.1) }}></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.06) }}></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.125), color: theme.colors.accent }}>
            Our Impact
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: theme.colors.text, fontFamily: theme.fonts?.heading }}>
            Numbers That Speak
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: hexWithAlpha(theme.colors.text, 0.6) }}>
            Real results from real customers who trusted us
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Happy Clients", value: "500+", icon: <FaUserGraduate /> },
            { label: "Years Experience", value: "10+", icon: <FaTrophy /> },
            { label: "Services", value: "15+", icon: <FaBook /> },
            { label: "Success Rate", value: "95%", icon: <FaGraduationCap /> }
          ].map((counter, index) => (
            <div 
              key={index} 
              className="group relative p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden"
              style={{ backgroundColor: theme.colors.background }}
            >
              <div className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-5" style={{ backgroundColor: theme.colors.accent }}></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-all duration-500" style={{ backgroundColor: theme.colors.accent }}></div>
              <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg" style={{ backgroundColor: theme.colors.accent }}>
                {counter.icon}
              </div>
              <p className="text-5xl md:text-6xl font-black mb-3" style={{ color: theme.colors.text }}>
                {counter.value}
              </p>
              <p className="text-lg font-semibold" style={{ color: hexWithAlpha(theme.colors.text, 0.6) }}>
                {counter.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderFeatures = () => (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: theme.colors.background }}>
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.1) }}></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.125), color: theme.colors.accent }}>
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: theme.colors.text, fontFamily: theme.fonts?.heading }}>
            Our Key Features
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Expert Team",
              desc: "Our skilled professionals bring years of experience to every project.",
              icon: "⚡"
            },
            {
              title: "Quality First",
              desc: "We maintain the highest standards in everything we deliver.",
              icon: "✅"
            },
            {
              title: "24/7 Support",
              desc: "We're here for you whenever you need assistance.",
              icon: "📞"
            },
            {
              title: "Custom Solutions",
              desc: "Tailored approaches to meet your unique needs.",
              icon: "🎯"
            },
            {
              title: "Fast Delivery",
              desc: "Timely results without compromising on quality.",
              icon: "🚀"
            },
            {
              title: "Affordable Pricing",
              desc: "Great value at competitive rates for all budgets.",
              icon: "💰"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <div className="text-5xl mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: theme.colors.text }}>
                {feature.title}
              </h3>
              <p style={{ color: hexWithAlpha(theme.colors.text, 0.6) }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderAbout = () => (
    !about ? null : (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: theme.colors.surface }}>
      <div className="absolute top-1/2 -translate-y-1/2 -left-40 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.1) }}></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-full h-full rounded-3xl -z-10" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.125) }}></div>
            <img
              src={aboutImageUrl}
              alt={`About ${businessName}`}
              className="w-full h-[600px] object-cover rounded-3xl shadow-2xl"
              loading="lazy"
              onError={() => setAboutImageError(true)}
            />
            <div className="absolute -bottom-8 -right-8 p-8 rounded-2xl shadow-2xl" style={{ backgroundColor: theme.colors.background }}>
              <p className="text-4xl font-black" style={{ color: theme.colors.accent }}>10+</p>
              <p className="font-semibold" style={{ color: theme.colors.text }}>Years of Excellence</p>
            </div>
          </div>
          <div>
            <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.125), color: theme.colors.accent }}>
              About Us
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-8" style={{ color: theme.colors.text, fontFamily: theme.fonts?.heading }}>
              {about.title}
            </h2>
            <p className="text-lg leading-relaxed mb-10" style={{ color: hexWithAlpha(theme.colors.text, 0.6) }}>
              {about.description}
            </p>
            <div className="space-y-6">
              {[
                { title: "Expert Team", desc: "Experienced professionals dedicated to your success" },
                { title: "Personalized Service", desc: "Custom solutions for every need" },
                { title: "Proven Results", desc: "Track record of success" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.125), color: theme.colors.accent }}>
                    <FaCheckCircle size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg" style={{ color: theme.colors.text }}>{item.title}</p>
                    <p style={{ color: hexWithAlpha(theme.colors.text, 0.5) }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
    )
  );

  const renderQuote = () => (
    <section className="py-32 relative overflow-hidden" style={{ backgroundColor: theme.colors.text }}>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.1) }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.06) }}></div>
      </div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-8 text-center">
        <div className="text-9xl font-black opacity-30 mb-8" style={{ color: theme.colors.accent }}>"</div>
        <blockquote className="text-3xl md:text-5xl font-bold leading-relaxed mb-10" style={{ color: theme.colors.surface, fontFamily: theme.fonts?.heading }}>
          Success is not final, failure is not fatal: it is the courage to continue that counts.
        </blockquote>
        <div className="flex items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: theme.colors.accent, color: theme.colors.surface }}>
            W
          </div>
          <div className="text-left">
            <p className="text-xl font-bold" style={{ color: theme.colors.surface }}>Winston Churchill</p>
            <p style={{ color: theme.colors.accent }}>Inspiration for Every Business</p>
          </div>
        </div>
      </div>
    </section>
  );

  const renderServicesGrid = () => (
    !services || services.length === 0 ? null : (
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: theme.colors.surface }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.125), color: theme.colors.accent }}>
              What We Offer
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: theme.colors.text, fontFamily: theme.fonts?.heading }}>
              Our Services
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service: Service, index: number) => (
              <div
                key={index}
                className="group rounded-3xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                style={{ backgroundColor: theme.colors.background }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getServiceImageUrl(index)}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    onError={() => setServiceImageErrors(prev => ({ ...prev, [index]: true }))}
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4" style={{ color: theme.colors.text }}>
                    {service.name}
                  </h3>
                  <p className="leading-relaxed mb-6" style={{ color: hexWithAlpha(theme.colors.text, 0.6) }}>
                    {service.description}
                  </p>
                  <button className="flex items-center gap-2 font-bold transition-all group-hover:gap-4" style={{ color: theme.colors.accent }}>
                    Learn More <FaArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  );

  const renderServicesOverlap = () => (
    !services || services.length === 0 ? null : (
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: theme.colors.background }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.125), color: theme.colors.accent }}>
              Our Services
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: theme.colors.text, fontFamily: theme.fonts?.heading }}>
              What We Do
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-0">
            {services.slice(0, 3).map((service: Service, index: number) => (
              <div
                key={index}
                className="group rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:z-10"
                style={{
                  backgroundColor: theme.colors.surface,
                  marginTop: index === 1 ? '40px' : 0,
                  marginLeft: index > 0 ? '-20px' : 0
                }}
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={getServiceImageUrl(index)}
                    alt={service.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => setServiceImageErrors(prev => ({ ...prev, [index]: true }))}
                  />
                  <div className="absolute inset-0" style={{ backgroundColor: hexWithAlpha(theme.colors.background, 0.5) }}></div>
                </div>
                <div className="p-8 -mt-20 relative">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4" style={{ backgroundColor: theme.colors.accent, color: theme.colors.surface }}>
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: theme.colors.text }}>
                    {service.name}
                  </h3>
                  <p className="leading-relaxed" style={{ color: hexWithAlpha(theme.colors.text, 0.6) }}>
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  );

  const renderServicesList = () => (
    !services || services.length === 0 ? null : (
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: theme.colors.surface }}>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.125), color: theme.colors.accent }}>
              Our Services
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: theme.colors.text, fontFamily: theme.fonts?.heading }}>
              What We Offer
            </h2>
          </div>
          <div className="space-y-6">
            {services.map((service: Service, index: number) => (
              <div
                key={index}
                className="group flex items-center gap-8 p-8 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-xl"
                style={{ backgroundColor: theme.colors.background }}
              >
                <div className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-4xl font-black" style={{ backgroundColor: theme.colors.accent, color: theme.colors.surface }}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
                    {service.name}
                  </h3>
                  <p style={{ color: hexWithAlpha(theme.colors.text, 0.6) }}>
                    {service.description}
                  </p>
                </div>
                <FaArrowRight size={24} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: theme.colors.accent }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  );

  const renderServices = () => {
    if (!services || services.length === 0) return null;
    if (structure.cardStyle === "overlap") return renderServicesOverlap();
    if (structure.cardStyle === "list") return renderServicesList();
    return renderServicesGrid();
  };

  const renderTestimonials = () => (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: theme.colors.surface }}>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.06) }}></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.125), color: theme.colors.accent }}>
            Success Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: theme.colors.text, fontFamily: theme.fonts?.heading }}>
            What Our Customers Say
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: hexWithAlpha(theme.colors.text, 0.6) }}>
            Real experiences from happy customers
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Rahul Sharma",
              role: "Happy Customer • Pune",
              quote: "Incredible service! They exceeded all my expectations and helped my business grow!",
              rating: 5,
              image: "smiling indian male headshot"
            },
            {
              name: "Priya Patel",
              role: "Happy Customer • Mumbai",
              quote: "Personal attention made all the difference. Highly recommend!",
              rating: 5,
              image: "smiling indian female headshot"
            },
            {
              name: "Amit Singh",
              role: "Happy Customer • Delhi",
              quote: "Great experience from start to finish! Professional and reliable.",
              rating: 5,
              image: "young indian man smiling portrait"
            }
          ].map((testimonial, index) => (
            <div
              key={index}
              className="p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              style={{ backgroundColor: theme.colors.background }}
            >
              <div className="flex gap-1 mb-6" style={{ color: theme.colors.accent }}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} size={22} />
                ))}
              </div>
              <p className="text-lg leading-relaxed mb-8 italic" style={{ color: hexWithAlpha(theme.colors.text, 0.8) }}>
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-5 pt-6 border-t" style={{ borderColor: hexWithAlpha(theme.colors.text, 0.08) }}>
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: theme.colors.accent }}>
                  <img
                    src={`https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(testimonial.image)}&image_size=square`}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: theme.colors.text }}>
                    {testimonial.name}
                  </p>
                  <p className="font-medium" style={{ color: theme.colors.accent }}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderGallery = () => (
    !imageMood?.stockImages?.gallery || imageMood.stockImages.gallery.length === 0 ? null : (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: theme.colors.surface }}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.125), color: theme.colors.accent }}>
            Our Gallery
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: theme.colors.text, fontFamily: theme.fonts?.heading }}>
            Behind the Scenes
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
    )
  );

  const renderContact = () => (
    !contact ? null : (
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: theme.colors.surface }}>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.125), color: theme.colors.accent }}>
              Get In Touch
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: theme.colors.text, fontFamily: theme.fonts?.heading }}>
              Contact Us Today
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6" style={{ color: theme.colors.text }}>
                Let's Talk
              </h3>
              <p className="mb-8" style={{ color: hexWithAlpha(theme.colors.text, 0.6) }}>
                Ready to get started? Reach out and we'll get back to you as soon as possible.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.125), color: theme.colors.accent }}>
                    📞
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: theme.colors.text }}>Phone</p>
                    <p style={{ color: hexWithAlpha(theme.colors.text, 0.5) }}>+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.125), color: theme.colors.accent }}>
                    📧
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: theme.colors.text }}>Email</p>
                    <p style={{ color: hexWithAlpha(theme.colors.text, 0.5) }}>hello@{businessName.toLowerCase().replace(/\s+/g, '')}.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: hexWithAlpha(theme.colors.accent, 0.125), color: theme.colors.accent }}>
                    📍
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: theme.colors.text }}>Location</p>
                    <p style={{ color: hexWithAlpha(theme.colors.text, 0.5) }}>123 Main St, City, State 12345</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 rounded-3xl shadow-xl" style={{ backgroundColor: theme.colors.background }}>
              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-5 py-4 rounded-xl border focus:outline-none focus:ring-2"
                  style={{ borderColor: hexWithAlpha(theme.colors.text, 0.19), backgroundColor: theme.colors.surface, color: theme.colors.text }}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-5 py-4 rounded-xl border focus:outline-none focus:ring-2"
                  style={{ borderColor: hexWithAlpha(theme.colors.text, 0.19), backgroundColor: theme.colors.surface, color: theme.colors.text }}
                />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl border focus:outline-none focus:ring-2"
                  style={{ borderColor: hexWithAlpha(theme.colors.text, 0.19), backgroundColor: theme.colors.surface, color: theme.colors.text }}
                />
                <button
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
                  style={{ backgroundColor: theme.colors.accent, color: theme.colors.surface }}
                >
                  {contact.ctaText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  );

  const renderCTA = () => (
    // guard: require contact cta
    !contact ? null : (
    <section className="py-32 relative overflow-hidden" style={{ backgroundColor: theme.colors.accent }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(theme.colors.surface, 0.06) }}></div>
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(theme.colors.surface, 0.06) }}></div>
      </div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-8">
        <div className="text-center">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-8" style={{ backgroundColor: hexWithAlpha(theme.colors.surface, 0.125), color: theme.colors.surface }}>Ready to Start?</span>
          <h2 className="text-4xl md:text-6xl font-black mb-8" style={{ color: theme.colors.surface }}>
            Your Journey Starts Here
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto" style={{ color: hexWithAlpha(theme.colors.surface, 0.87) }}>
            Join hundreds of successful customers who trusted us with their future.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="px-12 py-6 rounded-2xl font-bold text-xl transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-1" style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>
              {contact.ctaText}
            </button>
            <button className="border-2 px-12 py-6 rounded-2xl font-bold text-xl transition-all" style={{ borderColor: theme.colors.surface, color: theme.colors.surface }}>
              Book a Free Demo
            </button>
          </div>
        </div>
      </div>
    </section>
    )
  );

  const renderFooter = () => (
    <footer className="py-24 relative overflow-hidden" style={{ backgroundColor: theme.colors.text }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent" style={{ backgroundImage: `linear-gradient(to right, transparent, ${theme.colors.accent}, transparent)` }}></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-black mb-6" style={{ color: theme.colors.surface }}>{businessName}</h3>
            <p className="leading-relaxed mb-8 text-lg" style={{ color: hexWithAlpha(theme.colors.surface, 0.6) }}>
              Your trusted partner for success. Let's grow together.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: hexWithAlpha(theme.colors.surface, 0.08), color: theme.colors.surface }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.colors.accent} onMouseOut={(e) => e.currentTarget.style.backgroundColor = hexWithAlpha(theme.colors.surface, 0.08)}>
                <FaFacebook size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: hexWithAlpha(theme.colors.surface, 0.08), color: theme.colors.surface }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.colors.accent} onMouseOut={(e) => e.currentTarget.style.backgroundColor = hexWithAlpha(theme.colors.surface, 0.08)}>
                <FaInstagram size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: hexWithAlpha(theme.colors.surface, 0.08), color: theme.colors.surface }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme.colors.accent} onMouseOut={(e) => e.currentTarget.style.backgroundColor = hexWithAlpha(theme.colors.surface, 0.08)}>
                <FaTwitter size={20} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6" style={{ color: theme.colors.surface }}>Quick Links</h4>
            <ul className="space-y-4" style={{ color: hexWithAlpha(theme.colors.surface, 0.6) }}>
              <li><a href="#" className="transition-colors text-lg hover:text-[var(--accent-color)]" style={{ '--accent-color': theme.colors.accent } as React.CSSProperties}>Home</a></li>
              <li><a href="#" className="transition-colors text-lg hover:text-[var(--accent-color)]" style={{ '--accent-color': theme.colors.accent } as React.CSSProperties}>About Us</a></li>
              <li><a href="#" className="transition-colors text-lg hover:text-[var(--accent-color)]" style={{ '--accent-color': theme.colors.accent } as React.CSSProperties}>Programs</a></li>
              <li><a href="#" className="transition-colors text-lg hover:text-[var(--accent-color)]" style={{ '--accent-color': theme.colors.accent } as React.CSSProperties}>Success Stories</a></li>
              <li><a href="#" className="transition-colors text-lg hover:text-[var(--accent-color)]" style={{ '--accent-color': theme.colors.accent } as React.CSSProperties}>Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6" style={{ color: theme.colors.surface }}>Services</h4>
            <ul className="space-y-4" style={{ color: hexWithAlpha(theme.colors.surface, 0.6) }}>
              {services.slice(0, 4).map((service: Service, index: number) => (
                <li key={index}><a href="#" className="transition-colors text-lg hover:text-[var(--accent-color)]" style={{ '--accent-color': theme.colors.accent } as React.CSSProperties}>{service.name}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6" style={{ color: theme.colors.surface }}>Newsletter</h4>
            <p className="mb-6" style={{ color: hexWithAlpha(theme.colors.surface, 0.6) }}>Get the latest updates delivered to your inbox.</p>
            <div className="flex gap-3">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 px-5 py-4 rounded-xl border focus:outline-none"
                style={{ backgroundColor: hexWithAlpha(theme.colors.surface, 0.06), borderColor: hexWithAlpha(theme.colors.surface, 0.125), color: theme.colors.surface }}
              />
              <button className="px-6 py-4 rounded-xl font-bold transition-all" style={{ backgroundColor: theme.colors.accent, color: theme.colors.surface }}>
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t pt-10 flex flex-col md:flex-row items-center justify-between gap-6" style={{ borderColor: hexWithAlpha(theme.colors.surface, 0.125) }}>
          <p className="text-lg" style={{ color: hexWithAlpha(theme.colors.surface, 0.6) }}>© 2026 {businessName}. All Rights Reserved.</p>
          <div className="flex gap-8" style={{ color: hexWithAlpha(theme.colors.surface, 0.6) }}>
            <a href="#" className="transition-colors hover:text-[var(--accent-color)]" style={{ '--accent-color': theme.colors.accent } as React.CSSProperties}>Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-[var(--accent-color)]" style={{ '--accent-color': theme.colors.accent } as React.CSSProperties}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    hero: renderHero,
    stats: renderStats,
    features: renderFeatures,
    about: renderAbout,
    quote: renderQuote,
    services: renderServices,
    testimonials: renderTestimonials,
    gallery: renderGallery,
    contact: renderContact,
    cta: renderCTA,
    footer: renderFooter,
  };

  return (
    <div className="font-sans" style={previewRootStyle}>
      {renderNavbar()}
      {structure.sectionsOrder.map((s) => {
        const renderer = sectionRenderers[s];
        return renderer ? <div key={s}>{renderer()}</div> : null;
      })}
    </div>
  );
};

export default WebsitePreview;
