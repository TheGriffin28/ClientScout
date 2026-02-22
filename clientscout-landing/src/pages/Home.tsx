import Hero from '../components/landing/Hero';
import TrustStrip from '../components/landing/TrustStrip';
import ProblemSolution from '../components/landing/ProblemSolution';
import { FeatureDiscovery, FeatureCRM, FeatureAI, FeatureOutreach } from '../components/landing/FeatureSections';
import ScaleSection from '../components/landing/ScaleSection';
import TargetAudience from '../components/landing/TargetAudience';
import CallToAction from '../components/landing/CallToAction';

const Home = () => {
  return (
    <>
      <Hero />
      <TrustStrip />
      <ProblemSolution />
      
      {/* Feature Sections */}
      <div id="features">
        <FeatureDiscovery />
        <FeatureCRM />
        <FeatureAI />
        <FeatureOutreach />
      </div>

      <ScaleSection />
      <TargetAudience />
      <CallToAction />
    </>
  );
};

export default Home;
