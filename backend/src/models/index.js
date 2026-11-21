import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

import defineUser from './User.js';
import defineQuestion from './Question.js';
import defineCollection from './Collection.js';
import defineCollectionQuestion from './CollectionQuestion.js';
import defineGameSession from './GameSession.js';
import defineAnswerAttempt from './AnswerAttempt.js';

const User = defineUser(sequelize, DataTypes);
const Question = defineQuestion(sequelize, DataTypes);
const Collection = defineCollection(sequelize, DataTypes);
const CollectionQuestion = defineCollectionQuestion(sequelize, DataTypes);
const GameSession = defineGameSession(sequelize, DataTypes);
const AnswerAttempt = defineAnswerAttempt(sequelize, DataTypes);

// User -> Question
User.hasMany(Question, { foreignKey: 'author_id' });
Question.belongsTo(User, { foreignKey: 'author_id' });

// User -> Collection
User.hasMany(Collection, { foreignKey: 'author_id' });
Collection.belongsTo(User, { foreignKey: 'author_id' });

// User -> GameSession
User.hasMany(GameSession, { foreignKey: 'user_id' });
GameSession.belongsTo(User, { foreignKey: 'user_id' });

// User -> AnswerAttempt
User.hasMany(AnswerAttempt, { foreignKey: 'user_id' });
AnswerAttempt.belongsTo(User, { foreignKey: 'user_id' });

// Collection -> GameSession
Collection.hasMany(GameSession, { foreignKey: 'collection_id' });
GameSession.belongsTo(Collection, { foreignKey: 'collection_id' });

// Collection <-> Question (через CollectionQuestion)
Collection.belongsToMany(Question, {
  through: CollectionQuestion,
  foreignKey: 'collection_id',
  otherKey: 'question_id'
});
Question.belongsToMany(Collection, {
  through: CollectionQuestion,
  foreignKey: 'question_id',
  otherKey: 'collection_id'
});

// CollectionQuestion связи
CollectionQuestion.belongsTo(Collection, { foreignKey: 'collection_id' });
CollectionQuestion.belongsTo(Question, { foreignKey: 'question_id' });
Collection.hasMany(CollectionQuestion, { foreignKey: 'collection_id' });
Question.hasMany(CollectionQuestion, { foreignKey: 'question_id' });

// AnswerAttempt -> Question
AnswerAttempt.belongsTo(Question, { foreignKey: 'question_id' });
Question.hasMany(AnswerAttempt, { foreignKey: 'question_id' });

// AnswerAttempt -> GameSession (опционально)
AnswerAttempt.belongsTo(GameSession, { foreignKey: 'session_id' });
GameSession.hasMany(AnswerAttempt, { foreignKey: 'session_id' });

export {
  sequelize,
  User,
  Question,
  Collection,
  CollectionQuestion,
  GameSession,
  AnswerAttempt
};