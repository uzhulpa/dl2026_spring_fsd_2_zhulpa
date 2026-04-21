import { useNavigate } from 'react-router-dom';

function formatCreatedAt(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function CollectionCard({ collection }) {
  const navigate = useNavigate();
  const {
    id,
    name,
    description,
    questions_count: questionsCount,
    created_at: createdAt,
  } = collection;

  return (
    <article className="collection-card">
      <h2 className="collection-card__title">{name}</h2>
      <p className="collection-card__description">{description}</p>
      <p className="collection-card__meta">
        Вопросов: <strong>{questionsCount}</strong>
      </p>
      <p className="collection-card__date">{formatCreatedAt(createdAt)}</p>
      <button
        type="button"
        className="btn btn-primary collection-card__start"
        onClick={() => navigate(`/collections/${id}/play`)}
      >
        Начать
      </button>
    </article>
  );
}

export default CollectionCard;
