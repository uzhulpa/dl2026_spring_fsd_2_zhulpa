import 'dotenv/config';
import { sequelize } from '../models/index.js';
import { seedQuestions } from './seedQuestions.js';
import { seedCollections } from './seedCollections.js';
import { seedCollectionQuestions } from './seedCollectionQuestions.js';

async function runSeeds() {
  try {
    await sequelize.authenticate();
    console.log('[seed] DB connection: ok');

    await sequelize.sync({ alter: true });
    console.log('[seed] DB sync: ok');

    const questionsResult = await seedQuestions();
    const collectionsResult = await seedCollections();
    const linksResult = await seedCollectionQuestions();

    console.log('[seed] done:', {
      questions: questionsResult,
      collections: collectionsResult,
      collectionQuestions: {
        created: linksResult.created,
        skipped: linksResult.skipped,
        errors: linksResult.errors.length
      }
    });
  } catch (error) {
    console.error('[seed] failed:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

runSeeds();
