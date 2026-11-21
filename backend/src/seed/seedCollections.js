import { Collection } from '../models/index.js';

const SEED_AUTHOR_ID = 5;

const COLLECTION_SEEDS = [
  {
    name: 'Самые известные достопримечательности мира',
    description: 'Проверьте свои знания о главных символах разных стран: от Эйфелевой башни до Великой Китайской стены.',
    random_order: false,
    author_id: SEED_AUTHOR_ID
  },
  {
    name: 'Чудеса природы',
    description: 'Озёра, горы, водопады и каньоны — как хорошо вы знаете природные объекты нашей планеты?',
    random_order: true,
    author_id: SEED_AUTHOR_ID
  },
  {
    name: 'Европейское наследие',
    description: 'Путешествие по главным архитектурным и культурным памятникам Европы: от Колизея до Бранденбургских ворот.',
    random_order: false,
    author_id: SEED_AUTHOR_ID
  },
  {
    name: 'Точный удар (сложный уровень)',
    description: 'В этой коллекции нет радиуса — только точные точки. Придётся кликать максимально близко к правильному ответу!',
    random_order: true,
    author_id: SEED_AUTHOR_ID
  }
];

/**
 * Идемпотентно добавляет коллекции в БД (по паре name + author_id).
 * @returns {{ created: number, skipped: number, authorId: number }}
 */
async function seedCollections() {
  let created = 0;
  let skipped = 0;

  for (const row of COLLECTION_SEEDS) {
    const [_, wasCreated] = await Collection.findOrCreate({
      where: {
        name: row.name,
        author_id: row.author_id
      },
      defaults: {
        name: row.name,
        description: row.description,
        random_order: row.random_order,
        author_id: row.author_id,
        created_at: new Date()
      }
    });

    if (wasCreated) {
      created += 1;
    } else {
      skipped += 1;
    }
  }

  console.log(
    `[seed] collections: создано ${created}, уже было ${skipped}, author_id=${SEED_AUTHOR_ID}`
  );
  return { created, skipped, authorId: SEED_AUTHOR_ID };
}

export { seedCollections, COLLECTION_SEEDS };