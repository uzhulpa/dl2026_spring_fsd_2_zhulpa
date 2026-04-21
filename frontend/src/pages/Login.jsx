import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

function validateForm(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = 'Email обязателен';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Некорректный формат email';
  } else if (values.email.trim().length > 255) {
    errors.email = 'Email не может превышать 255 символов';
  }

  if (!values.password) {
    errors.password = 'Пароль обязателен';
  } else if (values.password.length > 255) {
    errors.password = 'Пароль слишком длинный';
  }

  return errors;
}

function Login() {
  const navigate = useNavigate();
  const { login: setAuthToken } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const errors = useMemo(() => validateForm(values), [values]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setServerError('');
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setTouched({ email: true, password: true });

    const formErrors = validateForm(values);
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const body = await loginUser({
        email: values.email.trim(),
        password: values.password,
      });

      const token =
        body?.data?.access_token ??
        body?.data?.token ??
        body?.access_token;

      if (!token) {
        setServerError('Сервер не вернул токен');
        return;
      }

      setAuthToken(token);
      navigate('/game');
    } catch (error) {
      setServerError(
        error.response?.data?.message || 'Не удалось выполнить вход'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>ВХОД</h1>

        <label className="form-field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.email && errors.email ? (
            <small className="field-error">{errors.email}</small>
          ) : null}
        </label>

        <label className="form-field">
          <span>Пароль</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.password && errors.password ? (
            <small className="field-error">{errors.password}</small>
          ) : null}
        </label>

        {serverError ? <p className="form-error">{serverError}</p> : null}

        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Вход...' : 'Войти'}
        </button>

        <p className="auth-note">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </form>
    </section>
  );
}

export default Login;
