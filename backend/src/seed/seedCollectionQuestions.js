import { Collection, Question, CollectionQuestion } from '../models/index.js';
import { COLLECTION_SEEDS } from './seedCollections.js';
import { QUESTION_SEEDS } from './seedQuestions.js';

const SEED_AUTHOR_ID = 5;

/**
 * Получить ID коллекции по имени
 */
async function getCollectionIdByName(name) {
  const collection = await Collection.findOne({
    where: { name, author_id: SEED_AUTHOR_ID }
  });
  return collection ? collection.id : null;
}

/**
 * Получить ID вопроса по заголовку и автору
 */
async function getQuestionIdByTitle(title) {
  const question = await Question.findOne({
    where: { title, author_id: SEED_AUTHOR_ID }
  });
  return question ? question.id : null;
}

/**
 * Сопоставление заголовков вопросов с коллекциями
 * 
 * Формат: { collectionName: [title1, title2, ...] }
 * Порядок в массиве определяет position (начиная с 1)
 */
const COLLECTION_QUESTIONS_MAP = {
  'Самые известные достопримечательности мира': [
    'Где находится Эйфелева башня?',
    'Где находится Колизей в Риме?',
    'Где находится Статуя Свободы?',
    'Где находится Тадж-Махал?',
    'Где находится Великая Китайская стена?',
    'Где находится Биг-Бен (Елизаветинская башня)?'
  ],
  'Чудеса природы': [
    'Где находится озеро Байкал?',
    'Где находится Эверест (Джомолунгма)?',
    'Где находится Ниагарский водопад?',
    'Где находится Гранд-Каньон?',
    'Где находится гора Килиманджаро?',
    'Где находится Мёртвое море?',
    'Где находится Йосемитский национальный парк?'
  ],
  'Европейское наследие': [
    'Где находится Пизанская башня?',
    'Где находится Акрополь в Афинах?',
    'Где находится Колизей в Риме?',
    'Где находится Венеция?',
    'Где находится Бранденбургские ворота?',
    'Где находится Биг-Бен (Елизаветинская башня)?'
  ],
  'Точный удар (сложный уровень)': [
    'Где находится Колизей в Риме?',
    'Где находится Биг-Бен (Елизаветинская башня)?',
    'Где находится Стоунхендж?',
    'Где находится Петра (древний город в Иордании)?',
    'Где находится Мачу-Пикчу?',
    'Где находится Ангкор-Ват?',
    'Где находится Кремль в Москве?'
  ]
};

/**
 * Идемпотентно добавляет связи коллекция-вопрос в БД
 * @returns {{ created: number, skipped: number, errors: Array }}
 */
async function seedCollectionQuestions() {
  let created = 0;
  let skipped = 0;
  const errors = [];

  for (const [collectionName, questionTitles] of Object.entries(COLLECTION_QUESTIONS_MAP)) {
    const collectionId = await getCollectionIdByName(collectionName);
    
    if (!collectionId) {
      errors.push(`Коллекция не найдена: ${collectionName}`);
      continue;
    }

    let position = 1;
    for (const title of questionTitles) {
      const questionId = await getQuestionIdByTitle(title);
      
      if (!questionId) {
        errors.push(`Вопрос не найден: "${title}" для коллекции "${collectionName}"`);
        continue;
      }

      const [_, wasCreated] = await CollectionQuestion.findOrCreate({
        where: {
          collection_id: collectionId,
          question_id: questionId
        },
        defaults: {
          collection_id: collectionId,
          question_id: questionId,
          position: position
        }
      });

      if (wasCreated) {
        created += 1;
      } else {
        // Если запись уже существует, обновим позицию на всякий случай
        await CollectionQuestion.update(
          { position: position },
          {
            where: {
              collection_id: collectionId,
              question_id: questionId
            }
          }
        );
        skipped += 1;
      }
      
      position += 1;
    }
  }

  console.log(
    `[seed] collection_questions: создано ${created}, обновлено/пропущено ${skipped}, ошибок ${errors.length}`
  );
  
  if (errors.length > 0) {
    console.error('[seed] Ошибки при создании связей:', errors);
  }
  
  return { created, skipped, errors };
}

/**
 * Получить все связи для проверки
 */
async function getAllCollectionQuestions() {
  const relations = await CollectionQuestion.findAll({
    include: [
      { model: Collection, attributes: ['name'] },
      { model: Question, attributes: ['title'] }
    ],
    order: [
      ['collection_id', 'ASC'],
      ['position', 'ASC']
    ]
  });
  
  return relations.map(r => ({
    collection: r.Collection ? r.Collection.name : `ID:${r.collection_id}`,
    question: r.Question ? r.Question.title : `ID:${r.question_id}`,
    position: r.position
  }));
}

export { seedCollectionQuestions, getAllCollectionQuestions, COLLECTION_QUESTIONS_MAP };