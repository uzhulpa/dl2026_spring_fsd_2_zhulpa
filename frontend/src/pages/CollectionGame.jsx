import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Map from '../components/game/Map';
import { useTimer } from '../hooks/useTimer';
import { startCollectionSession } from '../api/collections';
import { submitCollectionAnswer } from '../api/game';

function normalizeQuestion(q) {
  if (!q) return null;
  return {
    order: q.order,
    question_id: q.question_id,
    title: q.title,
    image_url: q.image_url,
    difficulty: q.difficulty,
  };
}

function CollectionGame() {
  const { collectionId } = useParams();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [question, setQuestion] = useState(null);
  const [clickPoint, setClickPoint] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loadingSession, setLoadingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const resultRef = useRef(null);
  resultRef.current = result;

  const { elapsedSeconds, start, reset, stop, getElapsedMs } = useTimer();

  const startSession = useCallback(async () => {
    setError('');
    setResult(null);
    setClickPoint(null);
    setQuestion(null);
    setSessionId(null);
    setTotalQuestions(0);
    reset();
    setLoadingSession(true);
    try {
      const data = await startCollectionSession(collectionId);
      setSessionId(data.session_id);
      setTotalQuestions(data.total_questions);
      setQuestion(normalizeQuestion(data.current_question));
    } catch (e) {
      setError(e.response?.data?.message || 'Не удалось начать сессию');
    } finally {
      setLoadingSession(false);
    }
  }, [collectionId, reset]);

  useEffect(() => {
    startSession();
  }, [startSession]);

  const sessionCompleted =
    Boolean(result) && result.session_status === 'completed';

  const handleMapReady = useCallback(() => {
    start();
  }, [start]);

  const handleSubmit = async () => {
    if (!question || !clickPoint || sessionId == null) return;
    setSubmitting(true);
    setError('');
    try {
      const response_time_ms = Math.round(getElapsedMs());
      const data = await submitCollectionAnswer({
        session_id: sessionId,
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

  const applyNextQuestion = useCallback(() => {
    const r = resultRef.current;
    if (!r?.next_question) return;
    setResult(null);
    setClickPoint(null);
    reset();
    setQuestion(normalizeQuestion(r.next_question));
  }, [reset]);

  const requestCloseResultModalToNext = () => {
    if (!result?.next_question) return;
    applyNextQuestion();
  };

  if (loadingSession && !question) {
    return (
      <section className="infinite-game infinite-game--loading">
        <p className="notice notice--info">Подготовка коллекции…</p>
      </section>
    );
  }

  if (error && !question) {
    return (
      <section className="infinite-game">
        <p className="form-error notice notice--error">{error}</p>
        <div className="collection-game__actions">
          <button type="button" className="btn btn-primary" onClick={() => navigate('/collections')}>
            К коллекциям
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => startSession()}>
            Повторить
          </button>
        </div>
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
                <p className="infinite-game__hint">
                  {typeof question.order === 'number' && totalQuestions > 0
                    ? `Вопрос ${question.order} из ${totalQuestions}. `
                    : null}
                  Кликните по карте, чтобы поставить метку
                </p>
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
                <p>
                  <strong>Отвечено:</strong> {result.questions_answered} из {result.total_questions}
                </p>
                <p>
                  <strong>Сумма очков:</strong> {result.total_score}
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
            ) : sessionCompleted ? (
              <button type="button" className="btn btn-primary infinite-game__submit" onClick={() => navigate('/collections')}>
                К коллекциям
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

export default CollectionGame;
