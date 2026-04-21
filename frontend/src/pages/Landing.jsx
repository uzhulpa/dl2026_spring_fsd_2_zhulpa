import HeroSection from '../components/landing/HeroSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import GameModesSection from '../components/landing/GameModesSection';
import LeaderboardSection from '../components/landing/LeaderboardSection';

function Landing() {
  return (
    <div className="landing-main">
      <HeroSection />
      <HowItWorksSection />
      <GameModesSection />
      <LeaderboardSection />
    </div>
  );
}

export default Landing;
