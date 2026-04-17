export default (sequelize, DataTypes) => {
    const Question = sequelize.define('Question', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    correct_longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      validate: {
        min: -180,
        max: 180
      }
    },
    correct_latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
      validate: {
        min: -90,
        max: 90
      }
    },
    question_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['point', 'point_with_radius']]
      }
    },
    radius_meters: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1
      }
    },
    difficulty: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: {
        min: 1,
        max: 10
      },
      defaultValue: 1
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'moderation',
      validate: {
        isIn: [['moderation', 'active', 'inactive']]
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'questions',
    timestamps: false
  });

  return Question;
};