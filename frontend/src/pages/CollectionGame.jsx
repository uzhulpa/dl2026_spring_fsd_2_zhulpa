import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import Map from '../components/game/Map';
import QuestionCard from '../components/game/QuestionCard';
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
  const [leaveResultModal, setLeaveResultModal] = useState(false);

  const resultRef = useRef(null);
  resultRef.current = result;

  const { elapsedSeconds, start, reset, stop, getElapsedMs } = useTimer();

  const startSession = useCallback(async () => {
    setLeaveResultModal(false);
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

  useEffect(() => {
    setLeaveResultModal(false);
  }, [result]);

  useEffect(() => {
    if (!result) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [result]);

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

  const handleResultModalPanelAnimationEnd = (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.animationName !== 'collection-modal-out') return;
    if (!leaveResultModal) return;
    applyNextQuestion();
  };

  const requestCloseResultModalToNext = () => {
    if (!result?.next_question) return;
    setLeaveResultModal(true);
  };

  if (loadingSession && !question) {
    return (
      <section className="infinite-game infinite-game--loading">
        <p>Подготовка коллекции…</p>
      </section>
    );
  }

  if (error && !question) {
    return (
      <section className="infinite-game">
        <p className="form-error">{error}</p>
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

  const resultModal =
    answered && result
      ? createPortal(
          <div
            className={`collection-result-modal${leaveResultModal ? ' collection-result-modal--leaving' : ''}`}
          >
            <div className="modal-backdrop collection-result-modal__backdrop" aria-hidden="true" />
            <div
              className="modal-dialog collection-result-modal__dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="collection-result-title"
            >
              <div
                className="modal-dialog__panel collection-result-modal__panel"
                onAnimationEnd={handleResultModalPanelAnimationEnd}
              >
                <h3 id="collection-result-title" className="modal-dialog__title">
                  Результат
                </h3>
                <p className="modal-dialog__text">
                  <strong>Расстояние:</strong>{' '}
                  {typeof result.distance_km === 'number'
                    ? result.distance_km.toFixed(2)
                    : result.distance_km}{' '}
                  км
                </p>
                <p className="modal-dialog__text">
                  <strong>Очки за попытку:</strong> {result.score_awarded}
                </p>
                {result.feedback ? (
                  <p className="modal-dialog__feedback">{result.feedback}</p>
                ) : null}

                {sessionCompleted ? (
                  <>
                    <div className="modal-dialog__divider" role="presentation" />
                    <h4 className="modal-dialog__subtitle">Итоги игры</h4>
                    <p className="modal-dialog__text">
                      <strong>Отвечено вопросов:</strong> {result.questions_answered} из{' '}
                      {result.total_questions}
                    </p>
                    <p className="modal-dialog__text modal-dialog__text--tight-bottom">
                      <strong>Сумма очков:</strong> {result.total_score}
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary modal-dialog__action"
                      onClick={() => navigate('/collections')}
                    >
                      К коллекциям
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary modal-dialog__action"
                    disabled={leaveResultModal}
                    onClick={requestCloseResultModalToNext}
                  >
                    Следующий вопрос
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <section className="infinite-game">
      {question ? (
        <>
          <QuestionCard
            title={question.title}
            imageUrl={question.image_url}
            difficulty={question.difficulty}
          />

          <div className="infinite-game__toolbar">
            <span className="infinite-game__timer">
              Время: <strong>{elapsedSeconds}</strong> с
            </span>
            {!answered ? (
              <span className="infinite-game__hint">
                {typeof question.order === 'number' && totalQuestions > 0
                  ? `Вопрос ${question.order} из ${totalQuestions}. `
                  : null}
                Кликните по карте, чтобы поставить метку
              </span>
            ) : null}
          </div>

          <div className="infinite-game__map-wrap">
            <Map
              key={question.question_id}
              onMapReady={handleMapReady}
              onClick={answered ? undefined : setClickPoint}
              clickPoint={clickPoint}
              correctPoint={answered ? correctPoint : null}
              readOnly={answered}
            />
          </div>

          {error ? <p className="form-error infinite-game__error">{error}</p> : null}

          {!answered ? (
            <button
              type="button"
              className="btn btn-primary infinite-game__submit"
              disabled={!clickPoint || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Отправка…' : 'Ответить'}
            </button>
          ) : null}
        </>
      ) : null}
      {resultModal}
    </section>
  );
}

export default CollectionGame;
