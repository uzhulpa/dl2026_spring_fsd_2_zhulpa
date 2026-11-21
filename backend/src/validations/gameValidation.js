import { z } from 'zod';

const infiniteAnswerSchema = z.object({
  question_id: z.coerce.number().refine(
    (n) => Number.isFinite(n) && Number.isInteger(n) && n > 0,
    { message: 'Некорректный идентификатор вопроса' }
  ),
  click_longitude: z.coerce.number().refine(
    (n) => Number.isFinite(n) && n >= -180 && n <= 180,
    { message: 'Долгота должна быть от -180 до 180' }
  ),
  click_latitude: z.coerce.number().refine(
    (n) => Number.isFinite(n) && n >= -90 && n <= 90,
    { message: 'Широта должна быть от -90 до 90' }
  ),
  response_time_ms: z.coerce.number().refine(
    (n) => Number.isFinite(n) && Number.isInteger(n) && n >= 0,
    { message: 'Время ответа должно быть целым неотрицательным числом' }
  ),
});

const collectionAnswerSchema = infiniteAnswerSchema.extend({
  session_id: z.coerce.number().refine(
    (n) => Number.isFinite(n) && Number.isInteger(n) && n > 0,
    { message: 'Некорректный идентификатор сессии' }
  ),
});

export { infiniteAnswerSchema, collectionAnswerSchema };
