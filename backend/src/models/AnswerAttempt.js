export default (sequelize, DataTypes) => {
    const AnswerAttempt = sequelize.define('AnswerAttempt', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    game_mode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['infinite', 'collection']]
      }
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    click_longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      validate: {
        min: -180,
        max: 180
      }
    },
    click_latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      validate: {
        min: -90,
        max: 90
      }
    },
    distance_km: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    response_time_ms: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    score_awarded: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'answer_attempts',
    timestamps: false
  });

  return AnswerAttempt;
}