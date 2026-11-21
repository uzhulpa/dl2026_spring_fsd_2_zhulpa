import { Link } from 'react-router-dom';

const modes = [
  {
    title: 'Бесконечный режим',
    text: 'Случайные вопросы без ограничений. Очки начисляются только за новый вопрос.',
    to: '/game',
  },
  {
    title: 'Коллекции',
    text: 'Готовые подборки по темам с отдельной таблицей лидеров.',
    to: '/collections',
  },
];

function GameModesSection() {
  return (
    <section className="landing-section">
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
