import z from "zod";

const adminQuestionSchema = z.object({
    title: z.string()
        .min(1, 'Текст вопроса обязателен')
        .max(200, 'Текст вопроса не может превышать 200 символов'),

    description: z.string()
        .optional()
        .nullable(),
    
    image_url: z.string()
        .url('Ссылка должна быть валидным URL')
        .optional()
        .nullable(),
    
    correct_longitude: z.preprocess(
        (val) => {
            if (typeof val === 'string') return parseFloat(val);
            if (typeof val === 'number') return val;
            return val;
        },
        z.number()
            .min(-180, 'Долгота должна быть от -180 до 180')
            .max(180, 'Долгота должна быть от -180 до 180')
    ),
    
    correct_latitude: z.preprocess(
        (val) => {
            if (typeof val === 'string') return parseFloat(val);
            if (typeof val === 'number') return val;
            return val;
        },
        z.number()
            .min(-90, 'Широта должна быть от -90 до 90')
            .max(90, 'Широта должна быть от -90 до 90')
    ),
    
    question_type: z.enum(['point', 'point_with_radius'], {
        errorMap: () => ({ message: 'Тип вопроса может быть "point" или "point_with_radius"' })
    }),

    radius_meters: z.preprocess(
        (val) => {
            if (typeof val === 'string') return parseInt(val, 10);
            if (typeof val === 'number') return val;
            return val;
        },
        z.number()
            .int('Радиус должен быть целым числом')
            .positive('Радиус должен быть больше 0')
            .optional()
            .nullable()
            .default(null)
    ),
    
    difficulty: z.preprocess(
        (val) => {
            if (typeof val === 'string') return parseInt(val, 10);
            if (typeof val === 'number') return val;
            return val;
        },
        z.number()
            .int('Сложность должна быть целым числом')
            .min(1, 'Сложность должна быть от 1 до 10')
            .max(10, 'Сложность должна быть от 1 до 10')
    ),
    
    status: z.enum(['moderation', 'active', 'inactive'], {
        errorMap: () => ({ message: 'Статус должен быть один из: moderation, active, inactive' })
    }).optional()
}).refine(data => {
    if (data.question_type === 'point_with_radius') {
        return data.radius_meters !== null && data.radius_meters !== undefined;
    }
    return true;
}, {
    message: 'radius_meters обязателен, когда тип вопроса "point_with_radius"',
    path: ['radius_meters']
});

export default adminQuestionSchema;