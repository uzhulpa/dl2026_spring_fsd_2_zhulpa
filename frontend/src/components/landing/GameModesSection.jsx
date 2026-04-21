import { Link } from 'react-router-dom';

const modes = [
  {
    title: 'БЕСКОНЕЧНЫЙ РЕЖИМ',
    text: 'Случайные вопросы без ограничений. Очки за новые вопросы',
    to: '/game',
  },
  {
    title: 'КОЛЛЕКЦИИ',
    text: 'Готовые подборки по темам. Соревнуйтесь с другими игроками',
    to: '/collections',
  },
];

function GameModesSection() {
  return (
    <section className="landing-section gradient-3">
      <h2>Режимы игры</h2>
      <div className="card-grid two-cols">
        {modes.map((mode) => (
          <Link key={mode.title} className="landing-card landing-link-card" to={mode.to}>
            <h3>{mode.title}</h3>
            <p>{mode.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default GameModesSection;
