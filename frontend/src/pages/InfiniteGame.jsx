import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Map from '../components/game/Map';
import QuestionCard from '../components/game/QuestionCard';
import { useTimer } from '../hooks/useTimer';
import { fetchInfiniteQuestion, submitInfiniteAnswer } from '../api/game';

function InfiniteGame() {
  const [question, setQuestion] = useState(null);
  const [clickPoint, setClickPoint] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [leaveResultModal, setLeaveResultModal] = useState(false);

  const { elapsedSeconds, start, reset, stop, getElapsedMs } = useTimer();

  const loadQuestion = useCallback(async () => {
    setLeaveResultModal(false);
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

  const handleResultModalPanelAnimationEnd = (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.animationName !== 'collection-modal-out') return;
    if (!leaveResultModal) return;
    loadQuestion();
  };

  const requestCloseResultModalToNext = () => {
    setLeaveResultModal(true);
  };

  if (loadingQuestion && !question) {
    return (
      <section className="infinite-game infinite-game--loading">
        <p>Загрузка вопроса…</p>
      </section>
    );
  }

  if (error && !question) {
    return (
      <section className="infinite-game">
        <p className="form-error">{error}</p>
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
              aria-labelledby="infinite-result-title"
            >
              <div
                className="modal-dialog__panel collection-result-modal__panel"
                onAnimationEnd={handleResultModalPanelAnimationEnd}
              >
                <h3 id="infinite-result-title" className="modal-dialog__title">
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
                <button
                  type="button"
                  className="btn btn-primary modal-dialog__action"
                  disabled={leaveResultModal}
                  onClick={requestCloseResultModalToNext}
                >
                  Следующий вопрос
                </button>
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
              <span className="infinite-game__hint">Кликните по карте, чтобы поставить метку</span>
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

export default InfiniteGame;
