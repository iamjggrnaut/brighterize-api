const sequelize = require('../db')
const { DataTypes } = require('sequelize');


const Content = sequelize.define('Content', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    media_url: { type: DataTypes.STRING, allowNull: true },
    preview_image: { type: DataTypes.STRING, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: true },
    content_structure: { type: DataTypes.JSONB, allowNull: true },
    likes_count: { type: DataTypes.INTEGER, defaultValue: () => Math.floor(Math.random() * (24 - 7 + 1)) + 7 },
    views_count: { type: DataTypes.INTEGER, defaultValue: () => Math.floor(Math.random() * (24 - 7 + 1)) + 7 },
    subscription_type: { type: DataTypes.ENUM('standard', 'premium'), allowNull: false },
    difficulty_level: { type: DataTypes.STRING, allowNull: true },
    estimated_time: { type: DataTypes.INTEGER, allowNull: true },
    tags: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
    author: { type: DataTypes.JSONB, allowNull: false },
    rating: { type: DataTypes.JSONB, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    availability: { type: DataTypes.JSONB, allowNull: true }
}, {
    tableName: 'contents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    profile_image: { type: DataTypes.STRING, allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
    subscription_status: { type: DataTypes.ENUM('standard', 'premium'), defaultValue: 'standard' },
    premium_end: { type: DataTypes.DATE, allowNull: true },
    last_login: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const UserLikes = sequelize.define('UserLikes', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
    content_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'contents', key: 'id' } },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'user_likes',
    timestamps: false
});

const UserViews = sequelize.define('UserViews', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
    content_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'contents', key: 'id' } },
    viewed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'user_views',
    timestamps: false
});

const Subscriptions = sequelize.define('Subscriptions', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
    subscription_type: { type: DataTypes.ENUM('standard', 'premium'), allowNull: false },
    start_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    end_date: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.ENUM('active', 'expired'), defaultValue: 'active' }
}, {
    tableName: 'subscriptions',
    timestamps: false
});

const Categories = sequelize.define('Categories', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true }
}, {
    tableName: 'categories',
    timestamps: false
});

const Logs = sequelize.define('Logs', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.STRING, allowNull: false },
    last_login: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: true },
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    ip_address: { type: DataTypes.STRING, allowNull: false },
}, {
    tableName: 'logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

User.belongsToMany(Content, { through: UserLikes });
Content.belongsToMany(User, { through: UserLikes });

User.belongsToMany(Content, { through: UserViews });
Content.belongsToMany(User, { through: UserViews });

Content.belongsTo(Categories, { foreignKey: 'category', targetKey: 'name' });
Categories.hasMany(Content, { foreignKey: 'category', sourceKey: 'name' });

User.hasMany(Logs);
Logs.belongsTo(User)

User.hasOne(Subscriptions, { foreignKey: 'user_id' });
Subscriptions.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { Content, User, UserLikes, UserViews, Subscriptions, Categories, Logs };
