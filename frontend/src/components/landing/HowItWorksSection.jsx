const steps = [
  {
    title: 'ШАГ 1',
    text: 'Вам показывается вопрос и картинка',
  },
  {
    title: 'ШАГ 2',
    text: 'Вы кликаете на место, где находится ответ',
  },
  {
    title: 'ШАГ 3',
    text: 'Получаете результат: расстояние и очки',
  },
];

function HowItWorksSection() {
  return (
    <section className="landing-section gradient-2">
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
