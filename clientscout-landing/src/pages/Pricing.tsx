import { useEffect } from 'react';
import PricingSection from '../components/landing/PricingSection';
import CallToAction from '../components/landing/CallToAction';

const Pricing = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-20">
      <PricingSection />
      <CallToAction />
    </div>
  );
};

export default Pricing;
