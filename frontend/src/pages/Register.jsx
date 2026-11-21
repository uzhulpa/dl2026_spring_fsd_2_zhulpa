import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth';

const nicknameRegex = /^[a-zA-Z0-9_]+$/;

function validateForm(values) {
  const errors = {};

  if (values.username.length < 3) {
    errors.username = 'Никнейм должен содержать минимум 3 символа';
  } else if (values.username.length > 50) {
    errors.username = 'Никнейм не может превышать 50 символов';
  } else if (!nicknameRegex.test(values.username)) {
    errors.username = 'Никнейм может содержать только буквы, цифры и нижнее подчеркивание';
  }

  if (!values.email) {
    errors.email = 'Email обязателен';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Некорректный формат email';
  } else if (values.email.length > 255) {
    errors.email = 'Email не может превышать 255 символов';
  }

  if (values.password.length < 6) {
    errors.password = 'Пароль должен содержать минимум 6 символов';
  } else if (values.password.length > 255) {
    errors.password = 'Пароль слишком длинный';
  } else if (!/[A-Z]/.test(values.password)) {
    errors.password = 'Пароль должен содержать хотя бы одну заглавную букву';
  } else if (!/[0-9]/.test(values.password)) {
    errors.password = 'Пароль должен содержать хотя бы одну цифру';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Подтвердите пароль';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Пароли не совпадают';
  }

  return errors;
}

function Register() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
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

    const nextTouched = {
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    };
    setTouched(nextTouched);

    const formErrors = validateForm(values);
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      await registerUser({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      navigate('/login');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Не удалось зарегистрироваться');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>РЕГИСТРАЦИЯ</h1>

        <label className="form-field">
          <span>Имя пользователя</span>
          <input
            name="username"
            type="text"
            autoComplete="username"
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.username && errors.username ? (
            <small className="field-error">{errors.username}</small>
          ) : null}
        </label>

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
          {touched.email && errors.email ? <small className="field-error">{errors.email}</small> : null}
        </label>

        <label className="form-field">
          <span>Пароль</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.password && errors.password ? (
            <small className="field-error">{errors.password}</small>
          ) : null}
        </label>

        <label className="form-field">
          <span>Подтверждение пароля</span>
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.confirmPassword && errors.confirmPassword ? (
            <small className="field-error">{errors.confirmPassword}</small>
          ) : null}
        </label>

        {serverError ? <p className="form-error">{serverError}</p> : null}

        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Отправка...' : 'Зарегистрироваться'}
        </button>

        <p className="auth-note">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </section>
  );
}

export default Register;
