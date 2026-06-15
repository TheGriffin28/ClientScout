import React, { useState, useEffect, useRef } from "react";
import { Lead, LayoutVersion, DesignRecipe } from "../../services/leadService";
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
  const previewRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = previewRootRef.current;
    if (!root || !layout) return;

    const sections = root.querySelectorAll<HTMLElement>(".preview-section-animate");
    sections.forEach((section) => section.classList.remove("is-revealed"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [layout?.templateKey, layout?.themeKey, layout]);

  if (!layout) return null;

  // Fallback design recipe if none is provided
  const getFallbackDesignRecipe = (): DesignRecipe => {
    const themeKey = (layout.themeKey || "light") as ThemeKey;
    const theme = getTheme(themeKey);
    return {
      colors: {
        primary: theme.colors.primary,
        secondary: theme.colors.primary,
        accent: theme.colors.accent,
        background: theme.colors.background,
        surface: theme.colors.surface,
        text: theme.colors.text,
      },
      typography: {
        headingFont: theme.fonts?.heading || "Inter, system-ui, sans-serif",
        bodyFont: theme.fonts?.body || "Inter, system-ui, sans-serif",
      },
      layout: {
        sections: ["hero", "stats", "features", "about", "services", "testimonials", "cta", "contact"],
        heroVariant: (layout as any).heroVariant || "centered",
        cardStyle: "grid",
        spacing: "regular",
      },
      aesthetic: "modern",
    };
  };

  // Fallback to old template system if needed
  const themeKey = (layout.themeKey || "light") as ThemeKey;
  const theme = getTheme(themeKey);

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
  
  const rawContent = (layout as any).content || (layout as any).design?.content || layout.content;
  const safeContent = ensureContent(rawContent);
  const { hero, about, services, contact } = safeContent;
  const imageMood = getImageMood(industry, businessType);
  const [heroImageError, setHeroImageError] = useState(false);
  const [aboutImageError, setAboutImageError] = useState(false);
  const [serviceImageErrors, setServiceImageErrors] = useState<Record<number, boolean>>({});
  const [galleryImageErrors, setGalleryImageErrors] = useState<Record<number, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get design recipe (AI-generated or fallback)
  const design: DesignRecipe = (layout as any).design || getFallbackDesignRecipe();
  
  const previewRootStyle: React.CSSProperties = {
    backgroundColor: design.colors.background,
    color: design.colors.text,
    fontFamily: design.typography.bodyFont,
  } as React.CSSProperties;

  const legacyToStructuralMap: Record<string, "corporate" | "creative" | "minimal" | "ecommerce" | "bold" | "elegant" | "playful" | "technical" | "nature"> = {
    "modern-business": "corporate",
    "premium-dark": "creative",
    "local-bright": "minimal",
    "minimal-fast": "minimal",
    "ecommerce-store": "ecommerce",
    "bold-edge": "bold",
    "elegant-classic": "elegant",
    "playful-fun": "playful",
    "technical-pro": "technical",
    "nature-green": "nature",
  };

  // Use design aesthetic as structural key if available, otherwise use legacy template
  const structuralKey = design.aesthetic as any || legacyToStructuralMap[layout.templateKey] || "corporate";
  const structure = getTemplate(legacyToStructuralMap[layout.templateKey] || "corporate");

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
    <nav className="sticky top-0 z-50 shadow-md backdrop-blur-xl" style={{ backgroundColor: hexWithAlpha(design.colors.surface, 0.9) }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        <div className="text-2xl font-bold" style={{ color: design.colors.text, fontFamily: design.typography.headingFont }}>
          {businessName}
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10 font-medium" style={{ color: design.colors.text }}>
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
            style={{ backgroundColor: design.colors.accent, color: design.colors.surface }}
          >
            {hero.primaryCta}
          </button>
        </div>
        
        {/* Mobile Hamburger Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: design.colors.text }}
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
        <div className="md:hidden border-t" style={{ borderColor: hexWithAlpha(design.colors.text, 0.1) }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-4">
            <a href="#" className="block py-3 font-medium" style={{ color: design.colors.text }} onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#" className="block py-3 font-medium" style={{ color: design.colors.text }} onClick={() => setMobileMenuOpen(false)}>About Us</a>
            <a href="#" className="block py-3 font-medium" style={{ color: design.colors.text }} onClick={() => setMobileMenuOpen(false)}>Programs</a>
            <a href="#" className="block py-3 font-medium" style={{ color: design.colors.text }} onClick={() => setMobileMenuOpen(false)}>Success Stories</a>
            <a href="#" className="block py-3 font-medium" style={{ color: design.colors.text }} onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <button
              className="w-full py-3 rounded-lg font-semibold transition-all"
              style={{ backgroundColor: design.colors.accent, color: design.colors.surface }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {hero.primaryCta}
            </button>
          </div>
        </div>
      )}
    </nav>
  );

  const renderHero = () => {
    if (!hero) return null;
    
    // --- Playful Hero ---
    if (structuralKey === 'playful') {
      return (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
          <div className="absolute top-0 left-10 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: design.colors.accent }}></div>
          <div className="absolute bottom-0 right-20 w-56 h-56 rounded-full opacity-25 blur-3xl" style={{ backgroundColor: design.colors.primary }}></div>
          <div className="absolute top-1/2 right-10 w-24 h-24 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: design.colors.accent }}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8 z-10">
            <div className="text-center mb-12">
              <span className="inline-block px-6 py-3 rounded-full text-sm font-bold mb-8" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.1), color: design.colors.accent }}>
                Welcome! 🎉
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-snug mb-6" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
                {hero.headline}
              </h1>
              <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto" style={{ color: hexWithAlpha(design.colors.text, 0.7) }}>
                {hero.tagline}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  className="px-12 py-5 rounded-full font-bold text-lg transition-all shadow-xl hover:-translate-y-2"
                  style={{ backgroundColor: design.colors.accent, color: design.colors.surface }}
                >
                  {hero.primaryCta} ✨
                </button>
                <button
                  className="px-12 py-5 rounded-full font-bold text-lg transition-all"
                  style={{ border: `2px solid ${design.colors.text}`, color: design.colors.text }}
                >
                  {hero.secondaryCta}
                </button>
              </div>
            </div>
            <div className="relative max-w-4xl mx-auto">
              <img
                src={heroImageUrl}
                alt={businessName}
                className="w-full h-[450px] md:h-[500px] object-cover rounded-3xl shadow-2xl"
                loading="lazy"
                onError={() => setHeroImageError(true)}
              />
            </div>
          </div>
        </section>
      )
    }
    
    // --- Bold Hero ---
    if (structuralKey === 'bold') {
      return (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.text }}>
          <div className="absolute inset-0">
            <div className="absolute -top-20 right-0 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: design.colors.accent }}></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: design.colors.surface }}></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8 z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-6" style={{ color: design.colors.surface, fontFamily: design.typography?.heading }}>
                  {hero.headline}
                </h1>
                <p className="text-xl md:text-2xl mb-10" style={{ color: hexWithAlpha(design.colors.surface, 0.8) }}>
                  {hero.tagline}
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                  <button
                    className="px-12 py-5 rounded-xl font-bold text-xl transition-all shadow-xl hover:-translate-y-2"
                    style={{ backgroundColor: design.colors.accent, color: design.colors.surface }}
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    className="px-12 py-5 rounded-xl font-bold text-xl transition-all"
                    style={{ border: `2px solid ${design.colors.surface}`, color: design.colors.surface }}
                  >
                    {hero.secondaryCta}
                  </button>
                </div>
              </div>
              <div>
                <img
                  src={heroImageUrl}
                  alt={businessName}
                  className="w-full h-[500px] md:h-[600px] object-cover rounded-3xl shadow-2xl"
                  loading="lazy"
                  onError={() => setHeroImageError(true)}
                />
              </div>
            </div>
          </div>
        </section>
      )
    }
    
    // --- Elegant Hero ---
    if (structuralKey === 'elegant') {
      return (
        <section className="py-32 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-8 z-10">
            <div className="text-center max-w-4xl mx-auto mb-16">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
                {hero.headline}
              </h1>
              <div className="w-32 h-1 mx-auto mb-6" style={{ backgroundColor: design.colors.accent }}></div>
              <p className="text-xl md:text-2xl mb-12" style={{ color: hexWithAlpha(design.colors.text, 0.7) }}>
                {hero.tagline}
              </p>
            </div>
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              <div className="lg:col-span-2">
                <img
                  src={heroImageUrl}
                  alt={businessName}
                  className="w-full h-[400px] md:h-[500px] object-cover rounded-2xl shadow-xl"
                  loading="lazy"
                  onError={() => setHeroImageError(true)}
                />
              </div>
              <div className="flex flex-col justify-between gap-6">
                <div className="p-8 rounded-2xl" style={{ backgroundColor: design.colors.background }}>
                  <p className="text-5xl font-black mb-2" style={{ color: design.colors.accent }}>10+</p>
                  <p className="text-lg" style={{ color: design.colors.text }}>Years Experience</p>
                </div>
                <div className="p-8 rounded-2xl" style={{ backgroundColor: design.colors.background }}>
                  <p className="text-5xl font-black mb-2" style={{ color: design.colors.accent }}>500+</p>
                  <p className="text-lg" style={{ color: design.colors.text }}>Happy Clients</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                className="px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl"
                style={{ backgroundColor: design.colors.accent, color: design.colors.surface }}
              >
                {hero.primaryCta}
              </button>
              <button
                className="px-10 py-4 rounded-full font-bold text-lg transition-all"
                style={{ border: `2px solid ${design.colors.text}`, color: design.colors.text }}
              >
                {hero.secondaryCta}
              </button>
            </div>
          </div>
        </section>
      )
    }
    
    // --- Technical Hero ---
    if (structuralKey === 'technical') {
      return (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5" style={{ border: `40px solid ${design.colors.accent}` }}></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8 z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-block px-4 py-2 text-sm font-bold uppercase tracking-widest mb-6" style={{ color: design.colors.accent }}>
                  New
                </span>
                <h1 className="text-5xl md:text-6xl font-black leading-snug mb-6" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
                  {hero.headline}
                </h1>
                <p className="text-lg mb-10" style={{ color: hexWithAlpha(design.colors.text, 0.7) }}>
                  {hero.tagline}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="px-10 py-4 rounded-lg font-bold transition-all shadow-lg"
                    style={{ backgroundColor: design.colors.accent, color: design.colors.surface }}
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    className="px-10 py-4 rounded-lg font-bold transition-all"
                    style={{ border: `1px solid ${hexWithAlpha(design.colors.text, 0.2)}`, color: design.colors.text }}
                  >
                    {hero.secondaryCta}
                  </button>
                </div>
              </div>
              <div>
                <img
                  src={heroImageUrl}
                  alt={businessName}
                  className="w-full h-[450px] object-cover rounded-lg shadow-xl"
                  loading="lazy"
                  onError={() => setHeroImageError(true)}
                />
              </div>
            </div>
          </div>
        </section>
      )
    }
    
    // --- Nature Hero ---
    if (structuralKey === 'nature') {
      return (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.background }}>
          <div className="absolute bottom-0 left-0 w-full h-48 opacity-30" style={{ background: `linear-gradient(to top, ${design.colors.accent}, transparent)` }}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8 z-10">
            <div className="text-center mb-16">
              <span className="inline-block px-6 py-3 rounded-full text-sm font-medium mb-8" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.1), color: design.colors.accent }}>
                🌿 {businessName}
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-snug mb-6" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
                {hero.headline}
              </h1>
              <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto" style={{ color: hexWithAlpha(design.colors.text, 0.7) }}>
                {hero.tagline}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  className="px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-lg"
                  style={{ backgroundColor: design.colors.accent, color: design.colors.surface }}
                >
                  {hero.primaryCta}
                </button>
                <button
                  className="px-10 py-5 rounded-2xl font-bold text-lg transition-all"
                  style={{ backgroundColor: design.colors.surface, color: design.colors.accent }}
                >
                  {hero.secondaryCta}
                </button>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImageUrl}
                alt={businessName}
                className="w-full h-[500px] md:h-[550px] object-cover rounded-3xl shadow-2xl"
                loading="lazy"
                onError={() => setHeroImageError(true)}
              />
            </div>
          </div>
        </section>
      )
    }
    
    // --- Corporate Hero (Default for corporate, creative, minimal, ecommerce) ---
    const heroVariant = (layout as any).heroVariant || structure.heroVariant[0];
    if (heroVariant === "left-image") {
      return (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-30 blur-3xl" style={{ backgroundColor: design.colors.accent }}></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: design.colors.primary }}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8 z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125), color: design.colors.accent }}>
                  Welcome to {businessName}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-snug mb-4" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
                  {hero.headline}
                </h1>
                <p className="text-lg leading-relaxed mb-8" style={{ color: hexWithAlpha(design.colors.text, 0.6) }}>
                  {hero.tagline}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1"
                    style={{ backgroundColor: design.colors.accent, color: design.colors.surface }}
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    className="border px-8 py-3.5 rounded-xl font-bold transition-all hover:bg-gray-100"
                    style={{ borderColor: design.colors.text, color: design.colors.text }}
                  >
                    {hero.secondaryCta}
                  </button>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative">
                <div className="absolute -top-6 -right-6 w-full h-full rounded-3xl -z-10" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125) }}></div>
                <img
                  src={heroImageUrl}
                  alt={businessName}
                  className="w-full h-[500px] object-cover rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  onError={() => setHeroImageError(true)}
                />
              </div>
            </div>
          </div>
        </section>
      )
    }
    if (heroVariant === "large-visual") {
      return (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroImageUrl}
              alt={businessName}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setHeroImageError(true)}
            />
            <div className="absolute inset-0" style={{ backgroundColor: hexWithAlpha(design.colors.background, 0.87) }}></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8 h-[750px] flex items-center justify-center py-20">
            <div className="text-center max-w-4xl" style={{ color: design.colors.text }}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6" style={{ fontFamily: design.typography?.heading }}>
                {hero.headline}
              </h1>
              <p className="text-xl md:text-2xl mb-10" style={{ color: hexWithAlpha(design.colors.text, 0.8) }}>
                {hero.tagline}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  className="px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl"
                  style={{ backgroundColor: design.colors.accent, color: design.colors.surface }}
                >
                  {hero.primaryCta}
                </button>
                <button
                  className="border-2 px-10 py-4 rounded-2xl font-bold text-lg transition-all"
                  style={{ borderColor: design.colors.text, color: design.colors.text }}
                >
                  {hero.secondaryCta}
                </button>
              </div>
            </div>
          </div>
        </section>
      )
    }
    return (
      <section className="py-24 text-center relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl" style={{ backgroundColor: design.colors.accent }}></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: design.colors.primary }}></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-snug mb-6" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
            {hero.headline}
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto" style={{ color: hexWithAlpha(design.colors.text, 0.6) }}>
            {hero.tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              className="px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1"
              style={{ backgroundColor: design.colors.accent, color: design.colors.surface }}
            >
              {hero.primaryCta}
            </button>
            <button
              className="border px-8 py-3.5 rounded-xl font-bold transition-all hover:bg-gray-100"
              style={{ borderColor: design.colors.text, color: design.colors.text }}
            >
              {hero.secondaryCta}
            </button>
          </div>
          <div className="relative">
            <img
              src={heroImageUrl}
              alt={businessName}
              className="w-full h-[400px] object-cover rounded-3xl shadow-2xl mx-auto hover:scale-105 transition-transform duration-700"
              loading="lazy"
              onError={() => setHeroImageError(true)}
            />
          </div>
        </div>
      </section>
    )
  };

  const renderStats = () => {
    if (structuralKey === 'playful') {
      return (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
          <div className="absolute -top-24 right-0 w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: design.colors.accent }}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125), color: design.colors.accent }}>
                Fun Facts!
              </span>
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
                We're Awesome!
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: "Happy Clients", value: "500+", icon: <FaUserGraduate /> },
                { label: "Years Experience", value: "10+", icon: <FaTrophy /> },
                { label: "Services", value: "15+", icon: <FaBook /> },
                { label: "Success Rate", value: "95%", icon: <FaGraduationCap /> }
              ].map((counter, index) => (
                <div 
                  key={index} 
                  className="group relative p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-rotate-2 overflow-hidden"
                  style={{ backgroundColor: design.colors.background }}
                >
                  <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: design.colors.accent }}></div>
                  <div className="relative">
                    <div className="text-7xl font-black mb-3" style={{ color: design.colors.accent }}>
                      {counter.value}
                    </div>
                    <p className="text-xl font-semibold" style={{ color: design.colors.text }}>
                      {counter.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    }
    
    if (structuralKey === 'bold') {
      return (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.text }}>
          <div className="absolute -top-24 left-0 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: design.colors.accent }}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8 text-center">
            <h2 className="text-4xl md:text-6xl font-black mb-16" style={{ color: design.colors.surface, fontFamily: design.typography?.heading }}>
              Bold Numbers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Happy Clients", value: "500+" },
                { label: "Years Experience", value: "10+" },
                { label: "Services", value: "15+" },
                { label: "Success Rate", value: "95%" }
              ].map((counter, index) => (
                <div 
                  key={index} 
                  className="border-t-4 pt-8"
                  style={{ borderColor: design.colors.accent }}
                >
                  <p className="text-6xl md:text-7xl font-black mb-3" style={{ color: design.colors.accent }}>
                    {counter.value}
                  </p>
                  <p className="text-xl font-semibold uppercase tracking-wider" style={{ color: design.colors.surface }}>
                    {counter.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    }
    
    if (structuralKey === 'elegant') {
      return (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-8">
            <div className="border-t border-b" style={{ borderColor: hexWithAlpha(design.colors.text, 0.1) }}>
              <div className="grid grid-cols-2 md:grid-cols-4">
                {[
                  { label: "Happy Clients", value: "500+" },
                  { label: "Years Experience", value: "10+" },
                  { label: "Services", value: "15+" },
                  { label: "Success Rate", value: "95%" }
                ].map((counter, index) => (
                  <div 
                    key={index} 
                    className="p-8 text-center"
                  >
                    <p className="text-5xl font-black mb-3" style={{ color: design.colors.accent, fontFamily: design.typography?.heading }}>
                      {counter.value}
                    </p>
                    <p className="text-lg" style={{ color: hexWithAlpha(design.colors.text, 0.7) }}>
                      {counter.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )
    }
    
    if (structuralKey === 'technical') {
      return (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
                Key Metrics
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Happy Clients", value: "500+" },
                { label: "Years Experience", value: "10+" },
                { label: "Services", value: "15+" },
                { label: "Success Rate", value: "95%" }
              ].map((counter, index) => (
                <div 
                  key={index} 
                  className="p-6 rounded-lg shadow-md"
                  style={{ backgroundColor: design.colors.background, borderLeft: `4px solid ${design.colors.accent}` }}
                >
                  <p className="text-4xl font-black mb-2" style={{ color: design.colors.accent }}>
                    {counter.value}
                  </p>
                  <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: hexWithAlpha(design.colors.text, 0.6) }}>
                    {counter.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    }
    
    if (structuralKey === 'nature') {
      return (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
          <div className="absolute bottom-0 left-0 w-full h-32 opacity-20" style={{ background: `linear-gradient(to top, ${design.colors.accent}, transparent)` }}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
                Growing Together
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Happy Clients", value: "500+" },
                { label: "Years Experience", value: "10+" },
                { label: "Services", value: "15+" },
                { label: "Success Rate", value: "95%" }
              ].map((counter, index) => (
                <div 
                  key={index} 
                  className="text-center"
                >
                  <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.1) }}>
                    <p className="text-3xl font-black" style={{ color: design.colors.accent }}>
                      {counter.value}
                    </p>
                  </div>
                  <p className="text-xl font-semibold" style={{ color: design.colors.text }}>
                    {counter.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    }
    
    // Default (corporate/creative/minimal/ecommerce)
    return (
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.1) }}></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.06) }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125), color: design.colors.accent }}>
              Our Impact
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
              Numbers That Speak
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: hexWithAlpha(design.colors.text, 0.6) }}>
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
                style={{ backgroundColor: design.colors.background }}
              >
                <div className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-5" style={{ backgroundColor: design.colors.accent }}></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-all duration-500" style={{ backgroundColor: design.colors.accent }}></div>
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg" style={{ backgroundColor: design.colors.accent }}>
                  {counter.icon}
                </div>
                <p className="text-5xl md:text-6xl font-black mb-3" style={{ color: design.colors.text }}>
                  {counter.value}
                </p>
                <p className="text-lg font-semibold" style={{ color: hexWithAlpha(design.colors.text, 0.6) }}>
                  {counter.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderFeatures = () => {
    if (structuralKey === 'playful') {
      return (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.background }}>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
                Why We're Fun!
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
                  className="p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105"
                  style={{ 
                    backgroundColor: design.colors.surface, 
                    border: `2px dashed ${hexWithAlpha(design.colors.accent, 0.3)}` 
                  }}
                >
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.1) }}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: design.colors.text }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: hexWithAlpha(design.colors.text, 0.6) }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    }
    
    if (structuralKey === 'bold') {
      return (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
                Why Choose Us
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
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
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-10 shadow-2xl"
                  style={{ 
                    backgroundColor: design.colors.accent,
                    color: design.colors.surface
                  }}
                >
                  <div className="text-7xl mb-6">{feature.icon}</div>
                  <h3 className="text-3xl font-bold mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-lg" style={{ color: hexWithAlpha(design.colors.surface, 0.9) }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    }
    
    if (structuralKey === 'elegant') {
      return (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.background }}>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
                What Makes Us Special
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
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
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex gap-6 items-start"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.1) }}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3" style={{ color: design.colors.text }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: hexWithAlpha(design.colors.text, 0.6) }}>
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    }
    
    if (structuralKey === 'technical') {
      return (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
                Our Features
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="p-6 rounded-lg shadow-sm"
                  style={{ 
                    backgroundColor: design.colors.background, 
                    border: `1px solid ${hexWithAlpha(design.colors.text, 0.1)}` 
                  }}
                >
                  <div className="text-3xl mb-4" style={{ color: design.colors.accent }}>{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: design.colors.text }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: hexWithAlpha(design.colors.text, 0.6) }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    }
    
    if (structuralKey === 'nature') {
      return (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.background }}>
          <div className="absolute -top-20 left-0 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: design.colors.accent }}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
                What Makes Us Grow
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
                  className="p-8 rounded-2xl shadow-lg"
                  style={{ backgroundColor: design.colors.surface }}
                >
                  <div className="text-6xl mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: design.colors.text }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: hexWithAlpha(design.colors.text, 0.6) }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    }
    
    // Default (corporate/creative/minimal/ecommerce)
    return (
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.background }}>
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.1) }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125), color: design.colors.accent }}>
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
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
                style={{ backgroundColor: design.colors.surface }}
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: design.colors.text }}>
                  {feature.title}
                </h3>
                <p style={{ color: hexWithAlpha(design.colors.text, 0.6) }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderAbout = () => (
    !about ? null : (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
      {/* Decorative gradient blobs */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-40 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.1) }}></div>
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: design.colors.primary }}></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-full h-full rounded-3xl -z-10" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125) }}></div>
            <img
              src={aboutImageUrl}
              alt={`About ${businessName}`}
              className="w-full h-[600px] object-cover rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-700"
              loading="lazy"
              onError={() => setAboutImageError(true)}
            />
            <div className="absolute -bottom-8 -right-8 p-8 rounded-2xl shadow-2xl" style={{ backgroundColor: design.colors.background }}>
              <p className="text-4xl font-black" style={{ color: design.colors.accent }}>10+</p>
              <p className="font-semibold" style={{ color: design.colors.text }}>Years of Excellence</p>
            </div>
          </div>
          <div>
            <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125), color: design.colors.accent }}>
              About Us
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-8" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
              {about.title}
            </h2>
            <p className="text-lg leading-relaxed mb-10" style={{ color: hexWithAlpha(design.colors.text, 0.6) }}>
              {about.description}
            </p>
            <div className="space-y-6">
              {[
                { title: "Expert Team", desc: "Experienced professionals dedicated to your success" },
                { title: "Personalized Service", desc: "Custom solutions for every need" },
                { title: "Proven Results", desc: "Track record of success" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125), color: design.colors.accent }}>
                    <FaCheckCircle size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg" style={{ color: design.colors.text }}>{item.title}</p>
                    <p style={{ color: hexWithAlpha(design.colors.text, 0.5) }}>{item.desc}</p>
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
    <section className="py-32 relative overflow-hidden" style={{ backgroundColor: design.colors.text }}>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.1) }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.06) }}></div>
      </div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-8 text-center">
        <div className="text-9xl font-black opacity-30 mb-8" style={{ color: design.colors.accent }}>"</div>
        <blockquote className="text-3xl md:text-5xl font-bold leading-relaxed mb-10" style={{ color: design.colors.surface, fontFamily: design.typography?.heading }}>
          Success is not final, failure is not fatal: it is the courage to continue that counts.
        </blockquote>
        <div className="flex items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: design.colors.accent, color: design.colors.surface }}>
            W
          </div>
          <div className="text-left">
            <p className="text-xl font-bold" style={{ color: design.colors.surface }}>Winston Churchill</p>
            <p style={{ color: design.colors.accent }}>Inspiration for Every Business</p>
          </div>
        </div>
      </div>
    </section>
  );

  const renderServicesGrid = () => (
    !services || services.length === 0 ? null : (
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125), color: design.colors.accent }}>
              What We Offer
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
              Our Services
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service: Service, index: number) => (
              <div
                key={index}
                className="group rounded-3xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                style={{ backgroundColor: design.colors.background }}
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
                  <h3 className="text-2xl font-bold mb-4" style={{ color: design.colors.text }}>
                    {service.name}
                  </h3>
                  <p className="leading-relaxed mb-6" style={{ color: hexWithAlpha(design.colors.text, 0.6) }}>
                    {service.description}
                  </p>
                  <button className="flex items-center gap-2 font-bold transition-all group-hover:gap-4" style={{ color: design.colors.accent }}>
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
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.background }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125), color: design.colors.accent }}>
              Our Services
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
              What We Do
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 3).map((service: Service, index: number) => (
              <div
                key={index}
                className="group flex flex-col rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)]"
                style={{ backgroundColor: design.colors.surface }}
              >
                <div className="relative h-56 sm:h-64 overflow-hidden shrink-0">
                  <img
                    src={getServiceImageUrl(index)}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    onError={() => setServiceImageErrors(prev => ({ ...prev, [index]: true }))}
                  />
                  <div
                    className="absolute bottom-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-lg"
                    style={{ backgroundColor: design.colors.accent, color: design.colors.surface }}
                  >
                    {index + 1}
                  </div>
                </div>
                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: design.colors.text }}>
                    {service.name}
                  </h3>
                  <p className="leading-relaxed flex-1" style={{ color: hexWithAlpha(design.colors.text, 0.6) }}>
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
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125), color: design.colors.accent }}>
              Our Services
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
              What We Offer
            </h2>
          </div>
          <div className="space-y-6">
            {services.map((service: Service, index: number) => (
              <div
                key={index}
                className="group flex items-center gap-8 p-8 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-xl"
                style={{ backgroundColor: design.colors.background }}
              >
                <div className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-4xl font-black" style={{ backgroundColor: design.colors.accent, color: design.colors.surface }}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: design.colors.text }}>
                    {service.name}
                  </h3>
                  <p style={{ color: hexWithAlpha(design.colors.text, 0.6) }}>
                    {service.description}
                  </p>
                </div>
                <FaArrowRight size={24} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: design.colors.accent }} />
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
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.06) }}></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125), color: design.colors.accent }}>
            Success Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
            What Our Customers Say
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: hexWithAlpha(design.colors.text, 0.6) }}>
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
              style={{ backgroundColor: design.colors.background }}
            >
              <div className="flex gap-1 mb-6" style={{ color: design.colors.accent }}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} size={22} />
                ))}
              </div>
              <p className="text-lg leading-relaxed mb-8 italic" style={{ color: hexWithAlpha(design.colors.text, 0.8) }}>
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-5 pt-6 border-t" style={{ borderColor: hexWithAlpha(design.colors.text, 0.08) }}>
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: design.colors.accent }}>
                  <img
                    src={`https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(testimonial.image)}&image_size=square`}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: design.colors.text }}>
                    {testimonial.name}
                  </p>
                  <p className="font-medium" style={{ color: design.colors.accent }}>
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
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125), color: design.colors.accent }}>
            Our Gallery
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
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
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.surface }}>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125), color: design.colors.accent }}>
              Get In Touch
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: design.colors.text, fontFamily: design.typography?.heading }}>
              Contact Us Today
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6" style={{ color: design.colors.text }}>
                Let's Talk
              </h3>
              <p className="mb-8" style={{ color: hexWithAlpha(design.colors.text, 0.6) }}>
                Ready to get started? Reach out and we'll get back to you as soon as possible.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125), color: design.colors.accent }}>
                    📞
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: design.colors.text }}>Phone</p>
                    <p style={{ color: hexWithAlpha(design.colors.text, 0.5) }}>+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125), color: design.colors.accent }}>
                    📧
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: design.colors.text }}>Email</p>
                    <p style={{ color: hexWithAlpha(design.colors.text, 0.5) }}>hello@{businessName.toLowerCase().replace(/\s+/g, '')}.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: hexWithAlpha(design.colors.accent, 0.125), color: design.colors.accent }}>
                    📍
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: design.colors.text }}>Location</p>
                    <p style={{ color: hexWithAlpha(design.colors.text, 0.5) }}>123 Main St, City, State 12345</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 rounded-3xl shadow-xl" style={{ backgroundColor: design.colors.background }}>
              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-5 py-4 rounded-xl border focus:outline-none focus:ring-2"
                  style={{ borderColor: hexWithAlpha(design.colors.text, 0.19), backgroundColor: design.colors.surface, color: design.colors.text }}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-5 py-4 rounded-xl border focus:outline-none focus:ring-2"
                  style={{ borderColor: hexWithAlpha(design.colors.text, 0.19), backgroundColor: design.colors.surface, color: design.colors.text }}
                />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl border focus:outline-none focus:ring-2"
                  style={{ borderColor: hexWithAlpha(design.colors.text, 0.19), backgroundColor: design.colors.surface, color: design.colors.text }}
                />
                <button
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
                  style={{ backgroundColor: design.colors.accent, color: design.colors.surface }}
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
    <section className="py-32 relative overflow-hidden" style={{ backgroundColor: design.colors.accent }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(design.colors.surface, 0.06) }}></div>
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl" style={{ backgroundColor: hexWithAlpha(design.colors.surface, 0.06) }}></div>
      </div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-8">
        <div className="text-center">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-8" style={{ backgroundColor: hexWithAlpha(design.colors.surface, 0.125), color: design.colors.surface }}>Ready to Start?</span>
          <h2 className="text-4xl md:text-6xl font-black mb-8" style={{ color: design.colors.surface }}>
            Your Journey Starts Here
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto" style={{ color: hexWithAlpha(design.colors.surface, 0.87) }}>
            Join hundreds of successful customers who trusted us with their future.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="px-12 py-6 rounded-2xl font-bold text-xl transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-1" style={{ backgroundColor: design.colors.surface, color: design.colors.text }}>
              {contact.ctaText}
            </button>
            <button className="border-2 px-12 py-6 rounded-2xl font-bold text-xl transition-all" style={{ borderColor: design.colors.surface, color: design.colors.surface }}>
              Book a Free Demo
            </button>
          </div>
        </div>
      </div>
    </section>
    )
  );

  const renderFooter = () => (
    <footer className="py-24 relative overflow-hidden" style={{ backgroundColor: design.colors.text }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent" style={{ backgroundImage: `linear-gradient(to right, transparent, ${design.colors.accent}, transparent)` }}></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-black mb-6" style={{ color: design.colors.surface }}>{businessName}</h3>
            <p className="leading-relaxed mb-8 text-lg" style={{ color: hexWithAlpha(design.colors.surface, 0.6) }}>
              Your trusted partner for success. Let's grow together.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: hexWithAlpha(design.colors.surface, 0.08), color: design.colors.surface }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = design.colors.accent} onMouseOut={(e) => e.currentTarget.style.backgroundColor = hexWithAlpha(design.colors.surface, 0.08)}>
                <FaFacebook size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: hexWithAlpha(design.colors.surface, 0.08), color: design.colors.surface }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = design.colors.accent} onMouseOut={(e) => e.currentTarget.style.backgroundColor = hexWithAlpha(design.colors.surface, 0.08)}>
                <FaInstagram size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: hexWithAlpha(design.colors.surface, 0.08), color: design.colors.surface }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = design.colors.accent} onMouseOut={(e) => e.currentTarget.style.backgroundColor = hexWithAlpha(design.colors.surface, 0.08)}>
                <FaTwitter size={20} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6" style={{ color: design.colors.surface }}>Quick Links</h4>
            <ul className="space-y-4" style={{ color: hexWithAlpha(design.colors.surface, 0.6) }}>
              <li><a href="#" className="transition-colors text-lg hover:text-[var(--accent-color)]" style={{ '--accent-color': design.colors.accent } as React.CSSProperties}>Home</a></li>
              <li><a href="#" className="transition-colors text-lg hover:text-[var(--accent-color)]" style={{ '--accent-color': design.colors.accent } as React.CSSProperties}>About Us</a></li>
              <li><a href="#" className="transition-colors text-lg hover:text-[var(--accent-color)]" style={{ '--accent-color': design.colors.accent } as React.CSSProperties}>Programs</a></li>
              <li><a href="#" className="transition-colors text-lg hover:text-[var(--accent-color)]" style={{ '--accent-color': design.colors.accent } as React.CSSProperties}>Success Stories</a></li>
              <li><a href="#" className="transition-colors text-lg hover:text-[var(--accent-color)]" style={{ '--accent-color': design.colors.accent } as React.CSSProperties}>Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6" style={{ color: design.colors.surface }}>Services</h4>
            <ul className="space-y-4" style={{ color: hexWithAlpha(design.colors.surface, 0.6) }}>
              {services.slice(0, 4).map((service: Service, index: number) => (
                <li key={index}><a href="#" className="transition-colors text-lg hover:text-[var(--accent-color)]" style={{ '--accent-color': design.colors.accent } as React.CSSProperties}>{service.name}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6" style={{ color: design.colors.surface }}>Newsletter</h4>
            <p className="mb-6" style={{ color: hexWithAlpha(design.colors.surface, 0.6) }}>Get the latest updates delivered to your inbox.</p>
            <div className="flex gap-3">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 px-5 py-4 rounded-xl border focus:outline-none"
                style={{ backgroundColor: hexWithAlpha(design.colors.surface, 0.06), borderColor: hexWithAlpha(design.colors.surface, 0.125), color: design.colors.surface }}
              />
              <button className="px-6 py-4 rounded-xl font-bold transition-all" style={{ backgroundColor: design.colors.accent, color: design.colors.surface }}>
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t pt-10 flex flex-col md:flex-row items-center justify-between gap-6" style={{ borderColor: hexWithAlpha(design.colors.surface, 0.125) }}>
          <p className="text-lg" style={{ color: hexWithAlpha(design.colors.surface, 0.6) }}>© 2026 {businessName}. All Rights Reserved.</p>
          <div className="flex gap-8" style={{ color: hexWithAlpha(design.colors.surface, 0.6) }}>
            <a href="#" className="transition-colors hover:text-[var(--accent-color)]" style={{ '--accent-color': design.colors.accent } as React.CSSProperties}>Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-[var(--accent-color)]" style={{ '--accent-color': design.colors.accent } as React.CSSProperties}>Terms of Service</a>
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
    <div ref={previewRootRef} className="font-sans" style={previewRootStyle}>
      {renderNavbar()}
      {structure.sectionsOrder.map((s) => {
        const renderer = sectionRenderers[s];
        return renderer ? (
          <div key={`${s}-${layout.templateKey}-${themeKey}`} className="preview-section-animate">
            {renderer()}
          </div>
        ) : null;
      })}
    </div>
  );
};

export default WebsitePreview;
