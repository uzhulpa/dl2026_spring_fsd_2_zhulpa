export default (sequelize, DataTypes) => {
    const CollectionQuestion = sequelize.define('CollectionQuestion', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    collection_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'collection_questions',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['collection_id', 'question_id']
      },
      {
        unique: true,
        fields: ['collection_id', 'position']
      }
    ]
  });

  return CollectionQuestion;
}