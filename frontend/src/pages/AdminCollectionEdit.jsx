import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchAdminCollectionById } from '../api/admin';
import { useAuth } from '../hooks/useAuth';

function formatDate(value) {
  if (!value) return 'Дата не указана';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ru-RU');
}

function normalizeCollection(collection) {
  const sortedQuestions = [...(collection.Questions || [])].sort(
    (a, b) => (a.CollectionQuestion?.position || 0) - (b.CollectionQuestion?.position || 0)
  );
  return {
    ...collection,
    name: collection.name ?? '',
    description: collection.description ?? '',
    random_order: Boolean(collection.random_order),
    Questions: sortedQuestions,
  };
}

function AdminCollectionEdit() {
  const { user } = useAuth();
  const { collectionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [collection, setCollection] = useState(null);
  const [draggedQuestionId, setDraggedQuestionId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchAdminCollectionById(collectionId);
        setCollection(normalizeCollection(data));
      } catch (e) {
        setError(e.response?.data?.message || 'Не удалось загрузить коллекцию');
        setCollection(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [collectionId]);

  const orderedQuestions = useMemo(() => {
    if (!collection) return [];
    return collection.Questions.map((question, index) => ({
      ...question,
      uiPosition: index + 1,
    }));
  }, [collection]);

  const moveQuestion = (sourceId, targetId) => {
    setCollection((prev) => {
      if (!prev) return prev;
      const list = [...prev.Questions];
      const sourceIndex = list.findIndex((q) => q.id === sourceId);
      const targetIndex = list.findIndex((q) => q.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return prev;
      const [moved] = list.splice(sourceIndex, 1);
      list.splice(targetIndex, 0, moved);
      return { ...prev, Questions: list };
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <section className="admin-questions-page">
        <p className="form-error">Доступ только для администратора.</p>
      </section>
    );
  }

  return (
    <section className="admin-questions-page">
      <div className="admin-question-editor__header">
        <h1 className="admin-questions-page__title">Редактирование коллекции</h1>
        <Link className="btn btn-secondary" to="/admin/collections">
          К списку коллекций
        </Link>
      </div>

      {loading ? <p>Загрузка данных коллекции…</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {collection && !loading ? (
        <form className="admin-question-editor__form" onSubmit={(event) => event.preventDefault()}>
          <label className="form-field form-field--readonly">
            <span>ID</span>
            <input value={String(collection.id)} disabled />
          </label>

          <label className="form-field">
            <span>Название</span>
            <input
              value={collection.name}
              onChange={(event) =>
                setCollection((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </label>

          <label className="form-field">
            <span>Описание</span>
            <textarea
              rows={4}
              value={collection.description}
              onChange={(event) =>
                setCollection((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </label>

          <label className="form-field">
            <span>Случайный порядок вопросов</span>
            <label className="admin-collection-edit__checkbox">
              <input
                type="checkbox"
                checked={collection.random_order}
                onChange={(event) =>
                  setCollection((prev) => ({ ...prev, random_order: event.target.checked }))
                }
              />
              <span>{collection.random_order ? 'Да' : 'Нет'}</span>
            </label>
          </label>

          <label className="form-field form-field--readonly">
            <span>Author ID</span>
            <input value={String(collection.author_id ?? '')} disabled />
          </label>

          <label className="form-field form-field--readonly">
            <span>Создана</span>
            <input value={formatDate(collection.created_at)} disabled />
          </label>

          <div className="admin-collection-edit__questions">
            <h2 className="admin-collection-edit__title">Вопросы в коллекции</h2>
            <p className="admin-collection-edit__hint">
              Перетаскивайте карточки, чтобы менять порядок. Сохранение пока не реализовано.
            </p>
            {orderedQuestions.length === 0 ? (
              <p>В коллекции нет вопросов.</p>
            ) : (
              <div className="admin-collection-edit__list">
                {orderedQuestions.map((question) => (
                  <article
                    key={question.id}
                    className={`admin-collection-edit__item${
                      draggedQuestionId === question.id ? ' admin-collection-edit__item--dragging' : ''
                    }`}
                    draggable
                    onDragStart={() => setDraggedQuestionId(question.id)}
                    onDragEnd={() => setDraggedQuestionId(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (draggedQuestionId == null) return;
                      moveQuestion(draggedQuestionId, question.id);
                    }}
                  >
                    <div className="admin-collection-edit__pos">{question.uiPosition}</div>
                    <div className="admin-collection-edit__item-main">
                      <p className="admin-question-card__title">{question.title}</p>
                      <p className="admin-question-card__feedback">
                        {question.description || 'Без описания'}
                      </p>
                    </div>
                    <div className="admin-collection-edit__item-meta">
                      <p>ID {question.id}</p>
                      <p>difficulty: {question.difficulty}</p>
                      <p>{question.status}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </form>
      ) : null}
    </section>
  );
}

export default AdminCollectionEdit;
