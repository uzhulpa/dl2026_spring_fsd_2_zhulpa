import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchAdminQuestionById, updateAdminQuestionById } from '../api/admin';
import Map from '../components/game/Map';
import { useAuth } from '../hooks/useAuth';

const EDITABLE_FIELDS = [
  'title',
  'description',
  'image_url',
  'correct_longitude',
  'correct_latitude',
  'question_type',
  'radius_meters',
  'difficulty',
  'status',
];

function formatDate(value) {
  if (!value) return 'Дата не указана';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ru-RU');
}

function normalizeQuestion(question) {
  return {
    ...question,
    title: question.title ?? '',
    description: question.description ?? '',
    image_url: question.image_url ?? '',
    correct_longitude: String(question.correct_longitude ?? ''),
    correct_latitude: String(question.correct_latitude ?? ''),
    question_type: question.question_type ?? 'point',
    radius_meters: question.question_type === 'point' ? '0' : String(question.radius_meters ?? ''),
    difficulty: String(question.difficulty ?? ''),
    status: question.status ?? 'moderation',
  };
}

function validateQuestionForm(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = 'Текст вопроса обязателен';
  else if (values.title.trim().length > 200) errors.title = 'Текст вопроса не может превышать 200 символов';
  if (values.image_url.trim()) {
    if (!URL.canParse(values.image_url.trim())) {
      errors.image_url = 'Ссылка должна быть валидным URL';
    }
  }
  const lon = Number(values.correct_longitude);
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) errors.correct_longitude = 'Долгота должна быть от -180 до 180';
  const lat = Number(values.correct_latitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) errors.correct_latitude = 'Широта должна быть от -90 до 90';
  if (!['point', 'point_with_radius'].includes(values.question_type)) errors.question_type = 'Тип вопроса может быть "point" или "point_with_radius"';
  if (values.question_type === 'point_with_radius') {
    const radius = Number(values.radius_meters);
    if (!Number.isInteger(radius)) errors.radius_meters = 'Радиус должен быть целым числом';
    else if (radius <= 0) errors.radius_meters = 'Радиус должен быть больше 0';
  }
  const difficulty = Number(values.difficulty);
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 10) errors.difficulty = 'Сложность должна быть от 1 до 10';
  if (!['moderation', 'active', 'inactive'].includes(values.status)) errors.status = 'Статус должен быть один из: moderation, active, inactive';
  return errors;
}

function AdminQuestionEdit() {
  const { user } = useAuth();
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [touched, setTouched] = useState({});
  const [formValues, setFormValues] = useState(null);
  const [originalValues, setOriginalValues] = useState(null);

  const loadDetails = async () => {
    setLoading(true);
    setError('');
    setSaveSuccess('');
    try {
      const details = await fetchAdminQuestionById(questionId);
      const normalized = normalizeQuestion(details);
      setOriginalValues(normalized);
      setFormValues(normalized);
    } catch (e) {
      setError(e.response?.data?.message || 'Не удалось загрузить данные вопроса');
      setOriginalValues(null);
      setFormValues(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  const formErrors = useMemo(() => (formValues ? validateQuestionForm(formValues) : {}), [formValues]);
  const isChanged = (field) => Boolean(formValues && originalValues && formValues[field] !== originalValues[field]);

  const onFieldChange = (name, value) => {
    setSaveSuccess('');
    setFormValues((prev) => {
      if (!prev) return prev;
      if (name === 'question_type' && value === 'point') return { ...prev, question_type: value, radius_meters: '0' };
      return { ...prev, [name]: value };
    });
  };

  const onCoordinateMapChange = ({ lat, lng }) => {
    onFieldChange('correct_latitude', lat.toFixed(7));
    onFieldChange('correct_longitude', lng.toFixed(7));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!formValues) return;
    const nextTouched = {};
    EDITABLE_FIELDS.forEach((field) => { nextTouched[field] = true; });
    setTouched(nextTouched);
    if (Object.keys(validateQuestionForm(formValues)).length > 0) return;
    const payload = {
      title: formValues.title.trim(),
      description: formValues.description.trim() ? formValues.description.trim() : null,
      image_url: formValues.image_url.trim() ? formValues.image_url.trim() : null,
      correct_longitude: Number(formValues.correct_longitude).toFixed(7),
      correct_latitude: Number(formValues.correct_latitude).toFixed(7),
      question_type: formValues.question_type,
      radius_meters: formValues.question_type === 'point' ? 0 : Number(formValues.radius_meters),
      difficulty: Number(formValues.difficulty),
      status: formValues.status,
    };
    setSubmitting(true);
    setError('');
    setSaveSuccess('');
    try {
      const updated = await updateAdminQuestionById(questionId, payload);
      const normalized = normalizeQuestion(updated);
      setOriginalValues(normalized);
      setFormValues(normalized);
      setSaveSuccess('Изменения сохранены');
    } catch (e) {
      setError(e.response?.data?.message || 'Не удалось сохранить вопрос');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <section className="admin-questions-page"><p className="form-error notice notice--error">Доступ только для администратора.</p></section>;
  }

  return (
    <section className="admin-questions-page">
      <div className="admin-question-editor__header">
        <h1 className="admin-questions-page__title">Редактирование вопроса</h1>
        <Link className="btn btn-secondary admin-collection-edit__back-btn" to="/admin/questions">К списку вопросов</Link>
      </div>
      {loading ? <p className="notice notice--info">Загрузка данных вопроса…</p> : null}
      {error ? <p className="form-error notice notice--error">{error}</p> : null}
      {saveSuccess ? <p className="admin-question-editor__success notice notice--success">{saveSuccess}</p> : null}

      {formValues && !loading ? (
        <form className="admin-question-editor__form" onSubmit={handleSave} noValidate>
          <h2 className="admin-collection-edit__section-title">Основные данные</h2>
          {formValues.image_url ? (
            <div className="admin-question-editor__image-wrap">
              <img src={formValues.image_url} alt="" className="admin-question-editor__image" />
            </div>
          ) : null}

          <div className="admin-collection-edit__row admin-collection-edit__row--identity">
            <label className="form-field form-field--readonly admin-collection-edit__meta-field admin-collection-edit__field-id">
              <span className="admin-collection-edit__meta-label">ID</span>
              <input value={String(formValues.id)} disabled />
            </label>
            <label className={`form-field admin-collection-edit__meta-field${isChanged('title') ? ' field-changed' : ''}`}><span className="admin-collection-edit__meta-label">Текст вопроса</span>
              <input value={formValues.title} onBlur={() => setTouched((p) => ({ ...p, title: true }))} onChange={(e) => onFieldChange('title', e.target.value)} />
              {touched.title && formErrors.title ? <small className="field-error">{formErrors.title}</small> : null}
            </label>
          </div>
          <label className={`form-field${isChanged('description') ? ' field-changed' : ''}`}><span>Фидбек</span>
            <textarea rows={4} value={formValues.description} onBlur={() => setTouched((p) => ({ ...p, description: true }))} onChange={(e) => onFieldChange('description', e.target.value)} />
          </label>
          <label className={`form-field${isChanged('image_url') ? ' field-changed' : ''}`}><span>URL изображения</span>
            <input value={formValues.image_url} onBlur={() => setTouched((p) => ({ ...p, image_url: true }))} onChange={(e) => onFieldChange('image_url', e.target.value)} />
            {touched.image_url && formErrors.image_url ? <small className="field-error">{formErrors.image_url}</small> : null}
          </label>
          <div className="admin-question-editor__coords">
            <label className={`form-field${isChanged('correct_longitude') ? ' field-changed' : ''}`}><span>Правильная долгота</span>
              <input value={formValues.correct_longitude} onBlur={() => setTouched((p) => ({ ...p, correct_longitude: true }))} onChange={(e) => onFieldChange('correct_longitude', e.target.value)} />
              {touched.correct_longitude && formErrors.correct_longitude ? <small className="field-error">{formErrors.correct_longitude}</small> : null}
            </label>
            <label className={`form-field${isChanged('correct_latitude') ? ' field-changed' : ''}`}><span>Правильная широта</span>
              <input value={formValues.correct_latitude} onBlur={() => setTouched((p) => ({ ...p, correct_latitude: true }))} onChange={(e) => onFieldChange('correct_latitude', e.target.value)} />
              {touched.correct_latitude && formErrors.correct_latitude ? <small className="field-error">{formErrors.correct_latitude}</small> : null}
            </label>
          </div>
          <div className="admin-question-editor__map-wrap">
            <Map clickPoint={{ lat: Number(formValues.correct_latitude) || 0, lng: Number(formValues.correct_longitude) || 0 }} onClick={onCoordinateMapChange} />
          </div>
          <h2 className="admin-collection-edit__section-title">Параметры</h2>
          <div className="admin-question-edit__row admin-question-edit__row--params">
            <label className={`form-field${isChanged('question_type') ? ' field-changed' : ''}`}><span>Тип вопроса</span>
              <select value={formValues.question_type} onBlur={() => setTouched((p) => ({ ...p, question_type: true }))} onChange={(e) => onFieldChange('question_type', e.target.value)}>
                <option value="point">point</option><option value="point_with_radius">point_with_radius</option>
              </select>
              {touched.question_type && formErrors.question_type ? <small className="field-error">{formErrors.question_type}</small> : null}
            </label>
            <label className={`form-field${isChanged('radius_meters') ? ' field-changed' : ''}`}><span>Радиус (метры)</span>
              <input value={formValues.question_type === 'point' ? '0' : formValues.radius_meters} disabled={formValues.question_type === 'point'} onBlur={() => setTouched((p) => ({ ...p, radius_meters: true }))} onChange={(e) => onFieldChange('radius_meters', e.target.value)} />
              {touched.radius_meters && formErrors.radius_meters ? <small className="field-error">{formErrors.radius_meters}</small> : null}
            </label>
            <label className={`form-field${isChanged('difficulty') ? ' field-changed' : ''}`}><span>Сложность (1-10)</span>
              <input value={formValues.difficulty} onBlur={() => setTouched((p) => ({ ...p, difficulty: true }))} onChange={(e) => onFieldChange('difficulty', e.target.value)} />
              {touched.difficulty && formErrors.difficulty ? <small className="field-error">{formErrors.difficulty}</small> : null}
            </label>
            <label className={`form-field${isChanged('status') ? ' field-changed' : ''}`}><span>Статус</span>
              <select value={formValues.status} onBlur={() => setTouched((p) => ({ ...p, status: true }))} onChange={(e) => onFieldChange('status', e.target.value)}>
                <option value="moderation">moderation</option><option value="active">active</option><option value="inactive">inactive</option>
              </select>
              {touched.status && formErrors.status ? <small className="field-error">{formErrors.status}</small> : null}
            </label>
          </div>
          <div className="admin-collection-edit__row admin-collection-edit__row--meta">
            <label className="form-field form-field--readonly admin-collection-edit__meta-field"><span className="admin-collection-edit__meta-label">Автор</span><input value={String(formValues.author_id ?? '')} disabled /></label>
            <label className="form-field form-field--readonly admin-collection-edit__meta-field"><span className="admin-collection-edit__meta-label">Создан</span><input value={formatDate(formValues.created_at)} disabled /></label>
            <label className="form-field form-field--readonly admin-collection-edit__meta-field"><span className="admin-collection-edit__meta-label">Обновлен</span><input value={formatDate(formValues.updated_at)} disabled /></label>
          </div>
          <div className="admin-question-editor__actions">
            <button type="submit" className="btn btn-primary admin-collection-edit__save-btn" disabled={submitting}>{submitting ? 'Сохранение…' : 'Сохранить'}</button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

export default AdminQuestionEdit;
