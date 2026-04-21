import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAdminQuestions } from '../api/admin';
import { useAuth } from '../hooks/useAuth';

const PER_PAGE = 10;

const STATUS_LABELS = {
  moderation: 'На модерации',
  active: 'Активен',
  inactive: 'Неактивен',
};

function formatDate(value) {
  if (!value) return 'Дата не указана';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getAuthorName(question) {
  return (
    question.author_name ||
    question.author_username ||
    question.author?.username ||
    question.username ||
    (question.author_id ? `ID ${question.author_id}` : 'Неизвестно')
  );
}

function AdminQuestions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadQuestions = useCallback(async (nextPage, nextStatus) => {
    setLoading(true);
    setError('');
    try {
      const params = nextStatus
        ? { status: nextStatus, page: nextPage, perPage: PER_PAGE }
        : { page: nextPage, perPage: PER_PAGE };
      const data = await fetchAdminQuestions(params);
      setQuestions(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Не удалось загрузить вопросы');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions(page, statusFilter);
  }, [loadQuestions, page, statusFilter]);

  if (!user || user.role !== 'admin') {
    return (
      <section className="admin-questions-page">
        <h1 className="admin-questions-page__title">Вопросы</h1>
        <p className="form-error notice notice--error">Доступ только для администратора.</p>
      </section>
    );
  }

  return (
    <section className="admin-questions-page">
      <div className="admin-questions-page__header">
        <h1 className="admin-questions-page__title">Вопросы</h1>
      </div>
      <div className="admin-questions-page__toolbar">
        <div className="admin-questions-page__filters">
          <label className="form-field">
            <span>Фильтр по статусу</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                const nextStatus = event.target.value;
                setStatusFilter(nextStatus);
                setPage(1);
              }}
            >
              <option value="">Все</option>
              <option value="active">active</option>
              <option value="moderation">moderation</option>
              <option value="inactive">inactive</option>
            </select>
          </label>
        </div>
        <button
          type="button"
          className="btn admin-questions-page__add-btn"
          onClick={() => navigate('/admin/questions/new')}
        >
          Добавить вопрос
        </button>
      </div>

      {loading ? <p className="notice notice--info">Загрузка…</p> : null}
      {error ? <p className="form-error notice notice--error">{error}</p> : null}

      {!loading && !error ? (
        <>
          {questions.length === 0 ? (
            <p className="notice notice--warning">Вопросов пока нет.</p>
          ) : (
            <div className="admin-questions-list">
              {questions.map((question) => (
                <article
                  key={question.id}
                  className="admin-question-card"
                  onClick={() => navigate(`/admin/questions/${question.id}`)}
                >
                  <div className="admin-question-card__thumb-wrap">
                    {question.image_url ? (
                      <img
                        src={question.image_url}
                        alt=""
                        className="admin-question-card__thumb"
                        loading="lazy"
                      />
                    ) : (
                      <div className="admin-question-card__thumb admin-question-card__thumb--empty">
                        Нет фото
                      </div>
                    )}
                  </div>

                  <div className="admin-question-card__content">
                    <p className="admin-question-card__title">{question.title}</p>
                    <p className="admin-question-card__feedback">{question.description || 'Без фидбека'}</p>
                  </div>

                  <div className="admin-question-card__meta">
                    <p className="admin-question-card__author">{getAuthorName(question)}</p>
                    <p className={`admin-question-card__status admin-question-card__status--${question.status}`}>
                      {STATUS_LABELS[question.status] || question.status}
                    </p>
                    <p className="admin-question-card__date">{formatDate(question.created_at)}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="admin-questions-page__pager">
            <button
              type="button"
              className="btn admin-questions-page__pager-btn"
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 1 || loading}
            >
              Назад
            </button>
            <span className="admin-questions-page__pager-current">Страница {page}</span>
            <button
              type="button"
              className="btn admin-questions-page__pager-btn"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={loading || questions.length < PER_PAGE}
            >
              Вперед
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default AdminQuestions;
