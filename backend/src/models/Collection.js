export default (sequelize, DataTypes) => {
    const Collection = sequelize.define('Collection', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    random_order: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'collections',
    timestamps: false
  });

  return Collection;
}