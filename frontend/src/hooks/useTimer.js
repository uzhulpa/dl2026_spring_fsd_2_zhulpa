import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Секундомер от момента вызова start().
 * reset() обнуляет и останавливает; getElapsedMs() — точное время на момент вызова.
 */
export function useTimer() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAtRef = useRef(null);
  const intervalRef = useRef(null);

  const tick = useCallback(() => {
    if (startedAtRef.current == null) return;
    setElapsedMs(Date.now() - startedAtRef.current);
  }, []);

  const start = useCallback(() => {
    if (startedAtRef.current != null) return;
    startedAtRef.current = Date.now();
    setElapsedMs(0);
    intervalRef.current = window.setInterval(tick, 100);
  }, [tick]);

  const stop = useCallback(() => {
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (startedAtRef.current != null) {
      const ms = Date.now() - startedAtRef.current;
      setElapsedMs(ms);
    }
    startedAtRef.current = null;
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startedAtRef.current = null;
    setElapsedMs(0);
  }, []);

  const getElapsedMs = useCallback(() => {
    if (startedAtRef.current == null) return 0;
    return Date.now() - startedAtRef.current;
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  return {
    elapsedMs,
    elapsedSeconds,
    start,
    stop,
    reset,
    getElapsedMs,
  };
}
