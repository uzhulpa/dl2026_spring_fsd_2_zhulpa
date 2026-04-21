import z from "zod";

const collectionQuestionSchema = z.object({
    question_id: z.preprocess(
        (val) => {
            if (typeof val === 'string') return parseInt(val, 10);
            if (typeof val === 'number') return val;
            return val;
        },
        z.number()
            .int('ID вопроса должен быть целым числом')
            .positive('ID вопроса должен быть положительным числом')
    ),
    position: z.preprocess(
        (val) => {
            if (typeof val === 'string') return parseInt(val, 10);
            if (typeof val === 'number') return val;
            return val;
        },
        z.number()
            .int('Позиция должна быть целым числом')
            .positive('Позиция должна быть больше 0')
    )
});

const baseCollectionSchema = {
    name: z.string()
        .min(1, 'Название коллекции обязательно')
        .max(100, 'Название коллекции не может превышать 100 символов'),
    
    description: z.string()
        .optional()
        .nullable(),
    
    random_order: z.preprocess(
        (val) => {
            if (typeof val === 'string') return val === 'true' || val === '1';
            if (typeof val === 'boolean') return val;
            return val;
        },
        z.boolean()
            .default(false)
    ),
    
    questions: z.array(collectionQuestionSchema)
        .min(1, 'Коллекция должна содержать хотя бы один вопрос')
};

const createCollectionSchema = z.object({
    ...baseCollectionSchema,
    name: baseCollectionSchema.name,
    description: baseCollectionSchema.description,
    random_order: baseCollectionSchema.random_order,
    questions: baseCollectionSchema.questions
}).refine(
    (data) => {
        const positions = data.questions.map(q => q.position);
        const uniquePositions = new Set(positions);
        if (positions.length !== uniquePositions.size) {
            return false;
        }
        
        const sortedPositions = [...positions].sort((a, b) => a - b);
        for (let i = 0; i < sortedPositions.length; i++) {
            if (sortedPositions[i] !== i + 1) {
                return false;
            }
        }
        
        return true;
    },
    {
        message: 'Позиции вопросов должны быть уникальными и идти последовательно от 1 до количества вопросов',
        path: ['questions']
    }
);

const updateCollectionSchema = z.object({
    name: baseCollectionSchema.name.optional(),
    description: baseCollectionSchema.description.optional(),
    random_order: baseCollectionSchema.random_order.optional(),
    questions: baseCollectionSchema.questions.optional()
}).refine(
    (data) => {
        if (data.questions) {
            const positions = data.questions.map(q => q.position);
            const uniquePositions = new Set(positions);
            if (positions.length !== uniquePositions.size) {
                return false;
            }
            
            const sortedPositions = [...positions].sort((a, b) => a - b);
            for (let i = 0; i < sortedPositions.length; i++) {
                if (sortedPositions[i] !== i + 1) {
                    return false;
                }
            }
        }
        return true;
    },
    {
        message: 'Позиции вопросов должны быть уникальными и идти последовательно от 1 до количества вопросов',
        path: ['questions']
    }
);

const collectionWithIdSchema = z.object({
    params: z.object({
        collectionId: z.preprocess(
            (val) => {
                if (typeof val === 'string') return parseInt(val, 10);
                if (typeof val === 'number') return val;
                return val;
            },
            z.number()
                .int('ID коллекции должен быть целым числом')
                .positive('ID коллекции должен быть положительным числом')
        )
    }),
    body: updateCollectionSchema
});

export {
    createCollectionSchema,
    updateCollectionSchema,
    collectionWithIdSchema
};