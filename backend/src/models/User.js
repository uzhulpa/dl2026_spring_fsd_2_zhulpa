export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: 'uk_users_username'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: 'uk_users_email'
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    registered_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'users',
    timestamps: false
  });

  return User;
};