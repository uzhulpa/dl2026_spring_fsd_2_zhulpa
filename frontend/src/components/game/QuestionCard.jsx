function QuestionCard({ title, imageUrl, difficulty }) {
  return (
    <article className="question-card">
      <h2 className="question-card__title">{title}</h2>
      {typeof difficulty === 'number' ? (
        <p className="question-card__meta">Сложность: {difficulty}</p>
      ) : null}
      {imageUrl ? (
        <div className="question-card__image-wrap">
          <img className="question-card__image" src={imageUrl} alt="" loading="lazy" />
        </div>
      ) : null}
    </article>
  );
}

export default QuestionCard;
