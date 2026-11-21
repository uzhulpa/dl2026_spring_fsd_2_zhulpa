import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="landing-section hero">
      <p className="hero__eyebrow">GeoQuiz</p>
      <h1>Проверьте, как хорошо вы знаете карту мира</h1>
      <p>
        Отвечайте на вопросы по географии, отмечайте точки на карте и сравнивайте результат в
        рейтинге.
      </p>
      <Link className="btn btn-primary hero-btn" to={user ? '/game' : '/login'}>
        Начать игру
      </Link>
    </section>
  );
}

export default HeroSection;
