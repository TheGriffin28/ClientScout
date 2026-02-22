import { Menu, X, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              ClientScout
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Features</Link>
            <Link to="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Pricing</Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Contact</Link>
            <a href="https://app.clientscout.xyz/signup" className="bg-gray-900 text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2">
              Get Started <ArrowRight size={16} />
            </a>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-gray-900">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute w-full bg-white/95 backdrop-blur-lg border-b border-gray-100 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="px-4 pt-2 pb-6 space-y-2">
          <Link to="/" className="block px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors font-medium" onClick={() => setIsOpen(false)}>Features</Link>
          <Link to="/pricing" className="block px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors font-medium" onClick={() => setIsOpen(false)}>Pricing</Link>
          <Link to="/contact" className="block px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors font-medium" onClick={() => setIsOpen(false)}>Contact</Link>
          <a href="https://app.clientscout.xyz/signup" className="w-full text-left px-4 py-3 text-blue-600 font-bold hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-2">
            Get Started <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
