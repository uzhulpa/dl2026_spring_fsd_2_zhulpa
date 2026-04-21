import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchAdminCollectionById, updateAdminCollectionById } from '../api/admin';
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

function validateCollection(values) {
  const errors = {};
  if (!values.name?.trim()) {
    errors.name = 'Название коллекции обязательно';
  } else if (values.name.trim().length > 200) {
    errors.name = 'Название не может превышать 200 символов';
  }
  return errors;
}

function AdminCollectionEdit() {
  const { user } = useAuth();
  const { collectionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [collection, setCollection] = useState(null);
  const [originalCollection, setOriginalCollection] = useState(null);
  const [touched, setTouched] = useState({});
  const [draggedQuestionId, setDraggedQuestionId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchAdminCollectionById(collectionId);
        const normalized = normalizeCollection(data);
        setCollection(normalized);
        setOriginalCollection(normalized);
      } catch (e) {
        setError(e.response?.data?.message || 'Не удалось загрузить коллекцию');
        setCollection(null);
        setOriginalCollection(null);
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

  const formErrors = useMemo(
    () => (collection ? validateCollection(collection) : {}),
    [collection]
  );

  const isChanged = (field) =>
    Boolean(collection && originalCollection && collection[field] !== originalCollection[field]);

  const moveQuestion = (sourceId, targetId) => {
    setCollection((prev) => {
      if (!prev) return prev;
      const list = [...prev.Questions];
      const sourceIndex = list.findIndex((q) => q.id === sourceId);
      const targetIndex = list.findIndex((q) => q.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return prev;
      const [moved] = list.splice(sourceIndex, 1);
      list.splice(targetIndex, 0, moved);
      setSaveSuccess('');
      return { ...prev, Questions: list };
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!collection) return;
    setTouched({ name: true });
    if (Object.keys(validateCollection(collection)).length > 0) return;

    const payload = {
      name: collection.name.trim(),
      description: collection.description?.trim() ? collection.description.trim() : null,
      random_order: Boolean(collection.random_order),
      questions: collection.Questions.map((question, index) => ({
        question_id: question.id,
        position: index + 1,
      })),
    };

    setSubmitting(true);
    setError('');
    setSaveSuccess('');
    try {
      const updated = await updateAdminCollectionById(collection.id, payload);
      const normalized = normalizeCollection(updated);
      setCollection(normalized);
      setOriginalCollection(normalized);
      setSaveSuccess('Изменения сохранены');
    } catch (e) {
      setError(e.response?.data?.message || 'Не удалось сохранить коллекцию');
    } finally {
      setSubmitting(false);
    }
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
      {saveSuccess ? <p className="admin-question-editor__success">{saveSuccess}</p> : null}

      {collection && !loading ? (
        <form className="admin-question-editor__form" onSubmit={handleSave}>
          <label className="form-field form-field--readonly">
            <span>ID</span>
            <input value={String(collection.id)} disabled />
          </label>

          <label className={`form-field${isChanged('name') ? ' field-changed' : ''}`}>
            <span>Название</span>
            <input
              value={collection.name}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              onChange={(event) =>
                setCollection((prev) => {
                  setSaveSuccess('');
                  return { ...prev, name: event.target.value };
                })
              }
            />
            {touched.name && formErrors.name ? (
              <small className="field-error">{formErrors.name}</small>
            ) : null}
          </label>

          <label className={`form-field${isChanged('description') ? ' field-changed' : ''}`}>
            <span>Описание</span>
            <textarea
              rows={4}
              value={collection.description}
              onChange={(event) =>
                setCollection((prev) => {
                  setSaveSuccess('');
                  return { ...prev, description: event.target.value };
                })
              }
            />
          </label>

          <label className={`form-field${isChanged('random_order') ? ' field-changed' : ''}`}>
            <span>Случайный порядок вопросов</span>
            <label className="admin-collection-edit__checkbox">
              <input
                type="checkbox"
                checked={collection.random_order}
                onChange={(event) =>
                  setCollection((prev) => {
                    setSaveSuccess('');
                    return { ...prev, random_order: event.target.checked };
                  })
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
            <p className="admin-collection-edit__hint">Перетаскивайте карточки, чтобы менять порядок.</p>
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

          <div className="admin-question-editor__actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

export default AdminCollectionEdit;
