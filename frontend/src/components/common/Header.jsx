import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <Link className="site-logo" to="/">
        GeoQuiz
      </Link>

      <nav className="site-nav">
        {user ? (
          <>
            <Link className="site-nav-link" to="/game">
              Бесконечный режим
            </Link>
            <Link className="site-nav-link" to="/collections">
              Коллекции
            </Link>
            {user.role === 'admin' ? (
              <Link className="site-nav-link" to="/admin/questions">
                Админ: Вопросы
              </Link>
            ) : null}
            <span className="site-username">{user.username}</span>
            <button type="button" className="site-logout" onClick={handleLogout}>
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link className="btn btn-secondary" to="/login">
              Войти
            </Link>
            <Link className="btn btn-primary" to="/register">
              Регистрация
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
