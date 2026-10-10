import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-5">
              <img src="/logo.svg" alt="ClientScout" className="h-12" />
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              ClientScout helps freelancers and agencies discover local businesses on Google Maps, analyze leads with AI,
              generate website mockups, and close deals with built-in CRM and outreach.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2 text-slate-500 text-sm">
              <li>
                <a href="/#features" className="hover:text-teal-600 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="/#website-generation" className="hover:text-teal-600 transition-colors">
                  Website generation
                </a>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-teal-600 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Legal & support</h4>
            <ul className="space-y-2 text-slate-500 text-sm">
              <li>
                <Link to="/contact" className="hover:text-teal-600 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-teal-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-teal-600 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2026 ClientScout. All rights reserved.</p>
          <p>Built for freelancers & agencies worldwide</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
