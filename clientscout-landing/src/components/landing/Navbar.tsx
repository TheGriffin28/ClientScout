import { Menu, X, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featureLink = isHome ? '#features' : '/#features';
  const howItWorksLink = isHome ? '#how-it-works' : '/#how-it-works';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img src="/logo.svg" alt="ClientScout" className="h-12" />
          </Link>

          <div className="hidden md:flex space-x-6 items-center">
            <a href={featureLink} className="text-slate-600 hover:text-teal-600 transition-colors font-medium text-sm">
              Features
            </a>
            <a href={howItWorksLink} className="text-slate-600 hover:text-teal-600 transition-colors font-medium text-sm">
              How it Works
            </a>
            <Link to="/pricing" className="text-slate-600 hover:text-teal-600 transition-colors font-medium text-sm">
              Pricing
            </Link>
            <Link to="/contact" className="text-slate-600 hover:text-teal-600 transition-colors font-medium text-sm">
              Contact
            </Link>
            <a
              href="https://app.clientscout.xyz/signup"
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all hover:shadow-lg flex items-center gap-2 text-sm font-semibold"
            >
              Get started <ArrowRight size={16} />
            </a>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-slate-600 hover:text-slate-900 p-2"
            aria-label="Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden absolute w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1">
          <a
            href={featureLink}
            className="block px-4 py-3 text-slate-600 hover:text-teal-600 hover:bg-slate-50 rounded-xl font-medium"
            onClick={() => setIsOpen(false)}
          >
            Features
          </a>
          <a
            href={howItWorksLink}
            className="block px-4 py-3 text-slate-600 hover:text-teal-600 hover:bg-slate-50 rounded-xl font-medium"
            onClick={() => setIsOpen(false)}
          >
            How it Works
          </a>
          <Link
            to="/pricing"
            className="block px-4 py-3 text-slate-600 hover:text-teal-600 hover:bg-slate-50 rounded-xl font-medium"
            onClick={() => setIsOpen(false)}
          >
            Pricing
          </Link>
          <Link
            to="/contact"
            className="block px-4 py-3 text-slate-600 hover:text-teal-600 hover:bg-slate-50 rounded-xl font-medium"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>
          <a
            href="https://app.clientscout.xyz/signup"
            className="block px-4 py-3 text-teal-600 font-bold"
            onClick={() => setIsOpen(false)}
          >
            Get started →
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
