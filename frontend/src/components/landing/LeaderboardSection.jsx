const leaders = [
  { place: 1, name: 'AtlasMaster', score: 1480 },
  { place: 2, name: 'GeoFox', score: 1325 },
  { place: 3, name: 'MapPilot', score: 1210 },
  { place: 4, name: 'NorthStar', score: 1150 },
  { place: 5, name: 'TerraNova', score: 1080 },
];

function LeaderboardSection() {
  return (
    <section className="landing-section gradient-4">
      <h2>Таблица лидеров</h2>
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
            {leaders.map((leader) => (
              <tr key={leader.place}>
                <td>{leader.place}</td>
                <td>{leader.name}</td>
                <td>{leader.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="btn btn-secondary" type="button">
        Смотреть полную таблицу
      </button>
    </section>
  );
}

export default LeaderboardSection;
