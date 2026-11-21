import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  fetchAdminCollectionById,
  suggestAdminQuestionsByTitle,
  updateAdminCollectionById,
} from '../api/admin';
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

function formatQuestionStatus(status) {
  const statusMap = {
    active: 'Активный',
    moderation: 'На модерации',
    inactive: 'Неактивный',
  };
  return statusMap[status] || status || 'Не указан';
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
  const [questionSearch, setQuestionSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState('');
  const [searchAttempted, setSearchAttempted] = useState(false);

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

  useEffect(() => {
    const title = questionSearch.trim();
    if (title.length < 3) {
      setSuggestions([]);
      setSuggestionsError('');
      setSearchAttempted(false);
      setSuggestionsLoading(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setSuggestionsLoading(true);
      setSuggestionsError('');
      setSearchAttempted(true);
      try {
        const data = await suggestAdminQuestionsByTitle(title);
        setSuggestions(data.slice(0, 5));
      } catch (e) {
        setSuggestions([]);
        setSuggestionsError(
          e.response?.data?.message || 'Не удалось получить подсказки вопросов'
        );
      } finally {
        setSuggestionsLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [questionSearch]);

  const appendQuestionFromSuggest = (question) => {
    setCollection((prev) => {
      if (!prev) return prev;
      const exists = prev.Questions.some((item) => item.id === question.id);
      if (exists) return prev;
      setSaveSuccess('');
      return {
        ...prev,
        Questions: [...prev.Questions, question],
      };
    });
    setQuestionSearch('');
    setSuggestions([]);
    setSearchAttempted(false);
  };

  const removeQuestionFromCollection = (questionId) => {
    setCollection((prev) => {
      if (!prev) return prev;
      setSaveSuccess('');
      return {
        ...prev,
        Questions: prev.Questions.filter((question) => question.id !== questionId),
      };
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
        <p className="form-error notice notice--error">Доступ только для администратора.</p>
      </section>
    );
  }

  return (
    <section className="admin-questions-page">
      <div className="admin-question-editor__header">
        <h1 className="admin-questions-page__title">Редактирование коллекции</h1>
        <Link className="btn btn-secondary admin-collection-edit__back-btn" to="/admin/collections">
          К списку коллекций
        </Link>
      </div>

      {loading ? <p className="notice notice--info">Загрузка данных коллекции…</p> : null}
      {error ? <p className="form-error notice notice--error">{error}</p> : null}
      {saveSuccess ? <p className="admin-question-editor__success notice notice--success">{saveSuccess}</p> : null}

      {collection && !loading ? (
        <form className="admin-question-editor__form" onSubmit={handleSave}>
          <h2 className="admin-collection-edit__section-title">Основные данные</h2>
          <div className="admin-collection-edit__row admin-collection-edit__row--identity">
            <label className="form-field form-field--readonly admin-collection-edit__meta-field admin-collection-edit__field-id">
              <span className="admin-collection-edit__meta-label">ID</span>
              <input value={String(collection.id)} disabled />
            </label>

            <label
              className={`form-field admin-collection-edit__meta-field${
                isChanged('name') ? ' field-changed' : ''
              }`}
            >
              <span className="admin-collection-edit__meta-label">Название</span>
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
          </div>

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

          <div className="admin-collection-edit__row admin-collection-edit__row--meta">
            <div
              className={`form-field admin-collection-edit__meta-field${
                isChanged('random_order') ? ' field-changed' : ''
              }`}
            >
              <span className="admin-collection-edit__meta-label">Случайный порядок</span>
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
            </div>

            <label className="form-field form-field--readonly admin-collection-edit__meta-field">
              <span className="admin-collection-edit__meta-label">Автор</span>
              <input value={String(collection.author_id ?? '')} disabled />
            </label>

            <label className="form-field form-field--readonly admin-collection-edit__meta-field">
              <span className="admin-collection-edit__meta-label">Создана</span>
              <input value={formatDate(collection.created_at)} disabled />
            </label>
          </div>

          <h2 className="admin-collection-edit__title">Вопросы в коллекции</h2>
          <p className="admin-collection-edit__hint">Перетаскивайте карточки, чтобы менять порядок.</p>
          <div className="admin-collection-edit__search">
            <label className="form-field">
              <span>Добавить вопрос по названию</span>
              <input
                value={questionSearch}
                onChange={(event) => {
                  setQuestionSearch(event.target.value);
                }}
                placeholder="Введите минимум 3 символа..."
              />
            </label>
            {suggestionsLoading ? <p className="admin-collection-edit__search-note">Поиск...</p> : null}
            {suggestionsError ? (
              <p className="form-error notice notice--error admin-collection-edit__search-note">{suggestionsError}</p>
            ) : null}
            {!suggestionsLoading &&
            !suggestionsError &&
            searchAttempted &&
            questionSearch.trim().length >= 3 &&
            suggestions.length === 0 ? (
              <p className="admin-collection-edit__search-note notice notice--warning">Нет вопросов с таким текстом</p>
            ) : null}
            {suggestions.length > 0 ? (
              <div className="admin-collection-edit__suggest-list">
                {suggestions.map((question) => (
                  <button
                    key={question.id}
                    type="button"
                    className="admin-collection-edit__suggest-item"
                    disabled={collection.Questions.some((item) => item.id === question.id)}
                    onClick={() => appendQuestionFromSuggest(question)}
                  >
                    <span className="admin-collection-edit__suggest-title">{question.title}</span>
                    <span className="admin-collection-edit__suggest-meta">ID {question.id}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {orderedQuestions.length === 0 ? (
            <p className="notice notice--warning">В коллекции нет вопросов.</p>
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
                    <p>Сложность: {question.difficulty}</p>
                    <p>{formatQuestionStatus(question.status)}</p>
                    <button
                      type="button"
                      className="btn btn-secondary admin-collection-edit__remove-btn"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        removeQuestionFromCollection(question.id);
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="admin-question-editor__actions">
            <button
              type="submit"
              className="btn btn-primary admin-collection-edit__save-btn"
              disabled={submitting}
            >
              {submitting ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

export default AdminCollectionEdit;
