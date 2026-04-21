import { useCallback, useEffect, useState } from 'react';
import Map from '../components/game/Map';
import { useTimer } from '../hooks/useTimer';
import { fetchInfiniteQuestion, submitInfiniteAnswer } from '../api/game';

function InfiniteGame() {
  const [question, setQuestion] = useState(null);
  const [clickPoint, setClickPoint] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { elapsedSeconds, start, reset, stop, getElapsedMs } = useTimer();

  const loadQuestion = useCallback(async () => {
    setError('');
    setResult(null);
    setClickPoint(null);
    reset();
    setQuestion(null);
    setLoadingQuestion(true);
    try {
      const data = await fetchInfiniteQuestion();
      setQuestion(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Не удалось загрузить вопрос');
    } finally {
      setLoadingQuestion(false);
    }
  }, [reset]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  const handleMapReady = useCallback(() => {
    start();
  }, [start]);

  const handleSubmit = async () => {
    if (!question || !clickPoint) return;
    setSubmitting(true);
    setError('');
    try {
      const response_time_ms = Math.round(getElapsedMs());
      const data = await submitInfiniteAnswer({
        question_id: question.question_id,
        click_longitude: clickPoint.lng,
        click_latitude: clickPoint.lat,
        response_time_ms,
      });
      stop();
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Не удалось отправить ответ');
    } finally {
      setSubmitting(false);
    }
  };

  const requestCloseResultModalToNext = () => {
    loadQuestion();
  };

  if (loadingQuestion && !question) {
    return (
      <section className="infinite-game infinite-game--loading">
        <p className="notice notice--info">Загрузка вопроса…</p>
      </section>
    );
  }

  if (error && !question) {
    return (
      <section className="infinite-game">
        <p className="form-error notice notice--error">{error}</p>
        <button type="button" className="btn btn-primary" onClick={() => loadQuestion()}>
          Повторить
        </button>
      </section>
    );
  }

  const answered = Boolean(result);
  const correctPoint = result
    ? { lat: result.correct_latitude, lng: result.correct_longitude }
    : null;

  return (
    <section className="infinite-game">
      {question ? (
        <div className="game-layout">
          <aside className="game-layout__left">
            <div className="game-layout__question">
              <div className="infinite-game__toolbar">
                <h2 className="question-card__title">{question.title}</h2>
                <span className="infinite-game__timer">
                  Время: <strong>{elapsedSeconds}</strong> с
                </span>
              </div>
              {typeof question.difficulty === 'number' ? (
                <p className="question-card__meta">Сложность: {question.difficulty}</p>
              ) : null}
              {!answered ? (
                <p className="infinite-game__hint">Кликните по карте, чтобы поставить метку</p>
              ) : null}
              {question.image_url ? (
                <div className="game-layout__image-wrap">
                  <img className="game-layout__image" src={question.image_url} alt="" loading="lazy" />
                </div>
              ) : null}
            </div>

            {answered && result ? (
              <div className="game-layout__result notice notice--success">
                {result.feedback ? <p className="infinite-game__feedback">{result.feedback}</p> : null}
              </div>
            ) : null}

            {answered && result ? (
              <div className="game-layout__stats">
                <p>
                  <strong>Расстояние:</strong>{' '}
                  {typeof result.distance_km === 'number' ? result.distance_km.toFixed(2) : result.distance_km} км
                </p>
                <p>
                  <strong>Очки за попытку:</strong> {result.score_awarded}
                </p>
              </div>
            ) : null}

            {error ? <p className="form-error notice notice--error infinite-game__error">{error}</p> : null}

            {!answered ? (
              <button
                type="button"
                className="btn btn-primary infinite-game__submit"
                disabled={!clickPoint || submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Отправка…' : 'Ответить'}
              </button>
            ) : (
              <button type="button" className="btn btn-primary infinite-game__submit" onClick={requestCloseResultModalToNext}>
                Следующий вопрос
              </button>
            )}
          </aside>

          <div className="infinite-game__map-wrap game-layout__map">
            <Map
              key={question.question_id}
              onMapReady={handleMapReady}
              onClick={answered ? undefined : setClickPoint}
              clickPoint={clickPoint}
              correctPoint={answered ? correctPoint : null}
              readOnly={answered}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default InfiniteGame;
