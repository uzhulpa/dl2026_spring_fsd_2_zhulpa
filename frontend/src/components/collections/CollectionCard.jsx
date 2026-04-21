import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCollectionLeaderboard } from '../../api/leaderboard';

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
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [leaders, setLeaders] = useState([]);
  const [loadingLeaders, setLoadingLeaders] = useState(false);
  const [leadersError, setLeadersError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [loadedPages, setLoadedPages] = useState({});
  const {
    id,
    name,
    description,
    questions_count: questionsCount,
    created_at: createdAt,
  } = collection;

  const loadLeaders = async (targetPage) => {
    setLoadingLeaders(true);
    setLeadersError('');
    try {
      const data = await fetchCollectionLeaderboard(id, { page: targetPage, perPage: 10 });
      setLeaders(data);
      setPage(targetPage);
      setHasMore(data.length === 10);
      setLoadedPages((prev) => ({ ...prev, [targetPage]: true }));
    } catch (e) {
      setLeadersError(e.response?.data?.message || e.message || 'Не удалось загрузить таблицу лидеров');
    } finally {
      setLoadingLeaders(false);
    }
  };

  const toggleExpand = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (nextExpanded && !loadedPages[page]) {
      loadLeaders(page);
    }
  };

  const handleLeaderboardPageChange = (nextPage) => {
    if (nextPage < 1 || loadingLeaders) return;
    loadLeaders(nextPage);
  };

  return (
    <article className={`collection-card collection-card--row${expanded ? ' collection-card--expanded' : ''}`}>
      <button type="button" className="collection-card__main" onClick={toggleExpand}>
        <div className="collection-card__title-wrap">
          <h2 className="collection-card__title">{name}</h2>
          <p className="collection-card__meta">
            Вопросов: <strong>{questionsCount}</strong>
          </p>
        </div>
        <p className="collection-card__description">{description}</p>
        <p className="collection-card__date">{formatCreatedAt(createdAt)}</p>
      </button>

      <button
        type="button"
        className="btn btn-primary collection-card__start"
        onClick={() => navigate(`/collections/${id}/play`)}
      >
        Начать
      </button>

      <div className={`collection-card__leaders${expanded ? ' collection-card__leaders--open' : ''}`}>
        <div className="collection-card__leaders-inner">
          <h3 className="collection-card__leaders-title">Таблица лидеров</h3>
          {loadingLeaders ? <p className="notice notice--info">Загрузка…</p> : null}
          {leadersError ? <p className="form-error notice notice--error">{leadersError}</p> : null}

          {!loadingLeaders && !leadersError ? (
            leaders.length > 0 ? (
              <>
                <div className="collection-card__leaders-table-wrap">
                  <table className="leaderboard-table">
                    <thead>
                      <tr>
                        <th>Место</th>
                        <th>Игрок</th>
                        <th>Очки</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaders.map((leader, index) => (
                        <tr key={`${leader.user_id}-${index}`}>
                          <td>{(page - 1) * 10 + index + 1}</td>
                          <td>{leader.username}</td>
                          <td>{Number(leader.total_score)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="collection-card__leaders-pager">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={page === 1 || loadingLeaders}
                    onClick={() => handleLeaderboardPageChange(page - 1)}
                  >
                    Назад
                  </button>
                  <span>Страница {page}</span>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!hasMore || loadingLeaders}
                    onClick={() => handleLeaderboardPageChange(page + 1)}
                  >
                    Вперед
                  </button>
                </div>
              </>
            ) : (
              <p className="notice notice--warning">Пока нет результатов.</p>
            )
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default CollectionCard;
