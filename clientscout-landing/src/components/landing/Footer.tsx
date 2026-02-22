import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img src="/logo.svg" alt="ClientScout Logo" className="h-14" />
              
            </Link>
            <p className="text-gray-500 mb-6 text-sm">
              ClientScout helps freelancers and agencies find local business leads from Google Maps, analyze them with AI, and convert them using built-in CRM and outreach tools.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Use Cases</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
          
          <div>
             <h4 className="font-bold text-gray-900 mb-4">Connect</h4>
             <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 ClientScout. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Made for freelancers & agencies worldwide 🌍
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
