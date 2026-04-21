import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <Link className="site-logo" to="/">
        GeoQuiz
      </Link>

      <nav className="site-nav site-nav--center" aria-label="Основная навигация">
        <ul className="site-nav-list">
          {isAdmin ? (
            <>
              <li>
                <Link className="site-nav-link" to="/admin/questions">
                  Вопросы
                </Link>
              </li>
              <li>
                <Link className="site-nav-link" to="/admin/collections">
                  Коллекции
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link className="site-nav-link" to="/game">
                  Игра
                </Link>
              </li>
              <li>
                <Link className="site-nav-link" to="/collections">
                  Коллекции
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="site-nav site-nav--right">
        {user ? (
          <ul className="site-nav-list">
            <li className="site-username">{user.username}</li>
            <li className="site-nav-separator">|</li>
            <li>
              <button type="button" className="site-logout" onClick={handleLogout}>
                Выйти
              </button>
            </li>
          </ul>
        ) : (
          <ul className="site-nav-list">
            <li>
              <Link className="site-nav-link" to="/login">
                Войти
              </Link>
            </li>
            <li className="site-nav-separator">|</li>
            <li>
              <Link className="site-nav-link" to="/register">
                Регистрация
              </Link>
            </li>
          </ul>
        )}
      </div>
    </header>
  );
}

export default Header;
