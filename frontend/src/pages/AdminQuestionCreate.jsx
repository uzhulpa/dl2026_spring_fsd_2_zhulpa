import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createAdminQuestion } from '../api/admin';
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
];

const initialValues = {
  title: '',
  description: '',
  image_url: '',
  correct_longitude: '0',
  correct_latitude: '0',
  question_type: 'point',
  radius_meters: '0',
  difficulty: '1',
};

function validateQuestionForm(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = 'Текст вопроса обязателен';
  else if (values.title.trim().length > 200) errors.title = 'Текст вопроса не может превышать 200 символов';
  if (values.image_url.trim() && !URL.canParse(values.image_url.trim())) {
    errors.image_url = 'Ссылка должна быть валидным URL';
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
  return errors;
}

function AdminQuestionCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const formErrors = useMemo(() => validateQuestionForm(formValues), [formValues]);

  const onFieldChange = (name, value) => {
    setSaveSuccess('');
    setFormValues((prev) => {
      if (name === 'question_type' && value === 'point') {
        return { ...prev, question_type: value, radius_meters: '0' };
      }
      return { ...prev, [name]: value };
    });
  };

  const onCoordinateMapChange = ({ lat, lng }) => {
    onFieldChange('correct_latitude', lat.toFixed(7));
    onFieldChange('correct_longitude', lng.toFixed(7));
  };

  const handleSave = async (event) => {
    event.preventDefault();
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
    };

    setSubmitting(true);
    setError('');
    setSaveSuccess('');
    try {
      const created = await createAdminQuestion(payload);
      setSaveSuccess('Вопрос создан');
      navigate(`/admin/questions/${created.id}`);
    } catch (e) {
      setError(e.response?.data?.message || 'Не удалось создать вопрос');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <section className="admin-questions-page"><p className="form-error">Доступ только для администратора.</p></section>;
  }

  return (
    <section className="admin-questions-page">
      <div className="admin-question-editor__header">
        <h1 className="admin-questions-page__title">Добавить вопрос</h1>
        <Link className="btn btn-secondary" to="/admin/questions">К списку вопросов</Link>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {saveSuccess ? <p className="admin-question-editor__success">{saveSuccess}</p> : null}

      <form className="admin-question-editor__form" onSubmit={handleSave} noValidate>
        {formValues.image_url ? (
          <div className="admin-question-editor__image-wrap">
            <img src={formValues.image_url} alt="" className="admin-question-editor__image" />
          </div>
        ) : null}

        <label className="form-field"><span>Текст вопроса</span>
          <input value={formValues.title} onBlur={() => setTouched((p) => ({ ...p, title: true }))} onChange={(e) => onFieldChange('title', e.target.value)} />
          {touched.title && formErrors.title ? <small className="field-error">{formErrors.title}</small> : null}
        </label>
        <label className="form-field"><span>Фидбек</span>
          <textarea rows={4} value={formValues.description} onBlur={() => setTouched((p) => ({ ...p, description: true }))} onChange={(e) => onFieldChange('description', e.target.value)} />
        </label>
        <label className="form-field"><span>URL изображения</span>
          <input value={formValues.image_url} onBlur={() => setTouched((p) => ({ ...p, image_url: true }))} onChange={(e) => onFieldChange('image_url', e.target.value)} />
          {touched.image_url && formErrors.image_url ? <small className="field-error">{formErrors.image_url}</small> : null}
        </label>
        <div className="admin-question-editor__coords">
          <label className="form-field"><span>Правильная долгота</span>
            <input value={formValues.correct_longitude} onBlur={() => setTouched((p) => ({ ...p, correct_longitude: true }))} onChange={(e) => onFieldChange('correct_longitude', e.target.value)} />
            {touched.correct_longitude && formErrors.correct_longitude ? <small className="field-error">{formErrors.correct_longitude}</small> : null}
          </label>
          <label className="form-field"><span>Правильная широта</span>
            <input value={formValues.correct_latitude} onBlur={() => setTouched((p) => ({ ...p, correct_latitude: true }))} onChange={(e) => onFieldChange('correct_latitude', e.target.value)} />
            {touched.correct_latitude && formErrors.correct_latitude ? <small className="field-error">{formErrors.correct_latitude}</small> : null}
          </label>
        </div>

        <div className="admin-question-editor__map-wrap">
          <Map clickPoint={{ lat: Number(formValues.correct_latitude) || 0, lng: Number(formValues.correct_longitude) || 0 }} onClick={onCoordinateMapChange} />
        </div>

        <label className="form-field"><span>Тип вопроса</span>
          <select value={formValues.question_type} onBlur={() => setTouched((p) => ({ ...p, question_type: true }))} onChange={(e) => onFieldChange('question_type', e.target.value)}>
            <option value="point">point</option><option value="point_with_radius">point_with_radius</option>
          </select>
          {touched.question_type && formErrors.question_type ? <small className="field-error">{formErrors.question_type}</small> : null}
        </label>
        <label className="form-field"><span>Радиус (метры)</span>
          <input value={formValues.question_type === 'point' ? '0' : formValues.radius_meters} disabled={formValues.question_type === 'point'} onBlur={() => setTouched((p) => ({ ...p, radius_meters: true }))} onChange={(e) => onFieldChange('radius_meters', e.target.value)} />
          {touched.radius_meters && formErrors.radius_meters ? <small className="field-error">{formErrors.radius_meters}</small> : null}
        </label>
        <label className="form-field"><span>Сложность (1-10)</span>
          <input value={formValues.difficulty} onBlur={() => setTouched((p) => ({ ...p, difficulty: true }))} onChange={(e) => onFieldChange('difficulty', e.target.value)} />
          {touched.difficulty && formErrors.difficulty ? <small className="field-error">{formErrors.difficulty}</small> : null}
        </label>

        <div className="admin-question-editor__actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/questions')}>Назад</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Сохранение…' : 'Сохранить'}</button>
        </div>
      </form>
    </section>
  );
}

export default AdminQuestionCreate;
