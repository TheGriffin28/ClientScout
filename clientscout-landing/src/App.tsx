import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/landing/Navbar';
import Footer from './components/landing/Footer';
import BackToTop from './components/landing/BackToTop';
import ScrollToTop from './components/landing/ScrollToTop';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function App() {
  return (
    <Router>
      <div className="min-h-screen overflow-x-hidden bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
        <Footer />
        <BackToTop />
      </div>
    </Router>
  );
}

export default App;
