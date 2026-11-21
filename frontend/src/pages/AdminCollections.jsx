import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAdminCollections } from '../api/admin';
import { useAuth } from '../hooks/useAuth';

const PER_PAGE = 10;

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

function AdminCollections() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCollections = useCallback(async (nextPage) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminCollections({ page: nextPage, perPage: PER_PAGE });
      setCollections(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Не удалось загрузить коллекции');
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollections(page);
  }, [loadCollections, page]);

  if (!user || user.role !== 'admin') {
    return (
      <section className="admin-questions-page">
        <h1 className="admin-questions-page__title">Коллекции</h1>
        <p className="form-error notice notice--error">Доступ только для администратора.</p>
      </section>
    );
  }

  return (
    <section className="admin-questions-page">
      <h1 className="admin-questions-page__title">Коллекции</h1>
      <button
          type="button"
          className="btn admin-questions-page__add-btn"
          onClick={() => navigate('/admin/collections/new')}
        >
          Добавить коллекцию
        </button>

      {loading ? <p className="notice notice--info">Загрузка…</p> : null}
      {error ? <p className="form-error notice notice--error">{error}</p> : null}

      {!loading && !error ? (
        <>
          {collections.length === 0 ? (
            <p className="notice notice--warning">Коллекций пока нет.</p>
          ) : (
            <div className="admin-questions-list">
              {collections.map((collection) => (
                <article
                  key={collection.id}
                  className="admin-collection-card"
                  onClick={() => navigate(`/admin/collections/${collection.id}`)}
                >
                  <div className="admin-collection-card__content">
                    <p className="admin-question-card__title">{collection.name}</p>
                    <p className="admin-question-card__feedback">
                      {collection.description || 'Без описания'}
                    </p>
                    <p className="admin-collection-card__count">
                      Вопросов: <strong>{collection.questions_count}</strong>
                    </p>
                  </div>

                  <div className="admin-question-card__meta">
                    <p className="admin-question-card__meta-label">Автор</p>
                    <p className="admin-question-card__author">
                      {collection.author_id ? `ID ${collection.author_id}` : 'Неизвестно'}
                    </p>
                    <p className="admin-question-card__date">{formatDate(collection.created_at)}</p>
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
              disabled={loading || collections.length < PER_PAGE}
            >
              Вперед
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default AdminCollections;
