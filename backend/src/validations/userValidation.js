import { z } from 'zod';

const createUserSchema = z.object({
  username: z.string()
    .min(3, 'Никнейм должен содержать минимум 3 символа')
    .max(50, 'Никнейм не может превышать 50 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Никнейм может содержать только буквы, цифры и нижнее подчеркивание'),
  
  email: z.string()
    .email('Некорректный формат email')
    .max(255, 'Email не может превышать 255 символов'),
  
  password: z.string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .max(255, 'Пароль слишком длинный')
    .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')
});

const loginSchema = z.object({
  email: z.string().email('Некорректный формат email'),
  password: z.string().min(1, 'Пароль обязателен')
});

export {
    createUserSchema,
    loginSchema
}