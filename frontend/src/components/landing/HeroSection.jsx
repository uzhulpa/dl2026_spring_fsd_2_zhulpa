import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="landing-section hero gradient-1">
      <h1>Географическая викторина</h1>
      <p>Проверьте свои знания карты мира!</p>
      <Link className="btn btn-primary hero-btn" to={user ? '/game' : '/login'}>
        Начать игру
      </Link>
    </section>
  );
}

export default HeroSection;
