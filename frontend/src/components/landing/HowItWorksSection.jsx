const steps = [
  {
    title: 'Выберите режим',
    text: 'Бесконечная игра или тематические коллекции',
  },
  {
    title: 'Отметьте точку',
    text: 'Кликните на карте, где, по вашему мнению, находится ответ',
  },
  {
    title: 'Получите результат',
    text: 'Смотрите расстояние, очки и прогресс в рейтинге',
  },
];

function HowItWorksSection() {
  return (
    <section className="landing-section">
      <h2>Как это работает</h2>
      <div className="card-grid three-cols">
        {steps.map((step) => (
          <article key={step.title} className="landing-card">
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HowItWorksSection;
