export default (sequelize, DataTypes) => {
    const GameSession = sequelize.define('GameSession', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    collection_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    current_question_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    question_order: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false
    },
    total_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    session_status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'active'
    }
  }, {
    tableName: 'game_sessions',
    timestamps: false
  });

  return GameSession;
};