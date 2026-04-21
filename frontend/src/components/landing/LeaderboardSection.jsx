import { useEffect, useState } from 'react';
import { fetchInfiniteLeaderboard } from '../../api/leaderboard';

function LeaderboardSection() {
  const [infiniteLeaders, setInfiniteLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      setError('');
      try {
        const infiniteData = await fetchInfiniteLeaderboard({ page: 1, perPage: 10 });
        setInfiniteLeaders(infiniteData);
      } catch (e) {
        setError(e.response?.data?.message || 'Не удалось загрузить таблицу лидеров');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const renderTable = (leaders) => (
    <div className="leaderboard-wrap">
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
              <td>{index + 1}</td>
              <td>{leader.username}</td>
              <td>{Number(leader.total_score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <section className="landing-section">
      <h2>Таблица лидеров</h2>
      {loading ? <p className="notice notice--info">Загрузка…</p> : null}
      {error ? <p className="form-error notice notice--error">{error}</p> : null}
      {!loading && !error ? (
        <>
          <h3>Бесконечный режим</h3>
          {infiniteLeaders.length > 0 ? renderTable(infiniteLeaders) : <p className="notice notice--warning">Пока нет результатов.</p>}
        </>
      ) : null}
    </section>
  );
}

export default LeaderboardSection;
