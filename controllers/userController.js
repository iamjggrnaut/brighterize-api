const { User, Logs, Subscriptions } = require('../models/models');
const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../utils/mailService');
const { default: axios } = require('axios');
const fs = require('node:fs/promises'); // Используем promises для async/await
const path = require('node:path');

async function deleteFile(filePath) {
    try {
        console.log('Attempting to delete:', filePath); // Логируем путь перед удалением
        await fs.unlink(filePath);
        console.log('Файл успешно удален:', filePath);
    } catch (err) {
        console.error('Ошибка при удалении файла:', filePath, err);
        if (err.code === 'ENOENT') {
            console.error('Файл не найден:', filePath);
        } else if (err.code === 'EACCES') {
            console.error('Нет доступа к файлу:', filePath);
        } else {
            console.error('Ошибка при удалении файла:', filePath, err);
        }
    }
}

// Генерация JWT с учетом обновленных данных
const generateJWT = (id, email, phone, first_name, last_name, role, subscription_status, profile_image, updatedAt) => {
    return jwt.sign(
        { id, email, phone, first_name, last_name, role, subscription_status, profile_image, updatedAt },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    );
};

async function getGeolocationByIP(ip) {
    try {
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching geolocation:", error);
        return null;
    }
}

class UserController {

    async register(req, res, next) {
        const { email, password, phone, first_name, last_name, paymentDetails } = req.body;

        try {
            // Валидация
            if (!email || !password || !phone || !first_name || !last_name || !paymentDetails) {
                throw ApiError.badRequest('All fields are required');
            }

            // Проверка на уникальность
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) throw ApiError.badRequest('Email already exists');

            // Хэширование пароля
            const hashPassword = await bcrypt.hash(password, 10);

            // Проверка платежных данных через сторонний сервис
            const paymentSuccess = await processPayment(paymentDetails);
            if (!paymentSuccess) throw ApiError.badRequest('Payment failed');

            // Создание пользователя
            const user = await User.create({
                email,
                phone,
                first_name,
                last_name,
                password: hashPassword,
                subscription_status: 'premium',
                premium_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });

            // Создание подписки
            await Subscriptions.create({
                user_id: user.id,
                subscription_type: 'premium',
                start_date: new Date(),
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: 'active',
            });

            // Генерация токена
            const token = generateJWT(user.id, user.email, user.phone, user.first_name, user.last_name, user.role, user.subscription_status);

            res.json({ token });
        } catch (error) {
            next(error);
        }
    }

    async registerStandard(req, res, next) {
        const { email, password, phone, first_name, last_name } = req.body;

        console.log('USERDATA: ', req.body);


        try {
            // Валидация
            if (!email || !password || !phone || !first_name || !last_name) {
                console.error('Validation failed: Missing fields');
                throw ApiError.badRequest('All fields are required');
            }

            // Проверка на уникальность
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                console.error('Validation failed: Email already exists');
                throw ApiError.badRequest('Email already exists');

            }

            // Хэширование пароля
            const hashPassword = await bcrypt.hash(password, 10);
            console.log('Password hashed successfully');

            // Создание пользователя
            const user = await User.create({
                email,
                phone,
                first_name,
                last_name,
                password: hashPassword,
                subscription_status: 'standard',
            });
            console.log('User created:', user);

            // Создание подписки
            await Subscriptions.create({
                user_id: user.id,
                subscription_type: 'standard',
                start_date: new Date(),
                status: 'active',
            });

            // Генерация токена
            const token = generateJWT(user.id, user.email, user.phone, user.first_name, user.last_name, user.role, user.subscription_status);

            res.json({ token });
        } catch (error) {
            console.error('Error occurred:', error.message)
            next(error);
        }
    }

    async upgradeSubscription(req, res, next) {
        const { paymentDetails } = req.body;
        const userId = req.user.id;

        try {
            const user = await User.findByPk(userId);

            if (!user) throw ApiError.notFound('User not found');
            if (user.subscription_status === 'premium') throw ApiError.badRequest('Already premium');

            // Проверка платежных данных
            const paymentSuccess = await processPayment(paymentDetails);
            if (!paymentSuccess) throw ApiError.badRequest('Payment failed');

            // Обновление подписки
            user.subscription_status = 'premium';
            user.premium_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await user.save();

            await Subscriptions.create({
                user_id: userId,
                subscription_type: 'premium',
                start_date: new Date(),
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: 'active',
            });

            res.json({ message: 'Subscription upgraded to Premium' });
        } catch (error) {
            next(error);
        }
    }


    async login(req, res, next) {
        const { email, password } = req.body;

        // Поиск пользователя по email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return next(ApiError.internal('User not found'));
        }

        // Проверка пароля
        const comparePassword = bcrypt.compareSync(password, user.password);
        if (!comparePassword) {
            return next(ApiError.internal('Wrong password'));
        }

        const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress;

        await Logs.create({
            user_id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            ip_address: ip
        })

        // Генерация JWT
        const token = generateJWT(user.id, user.email, user.phone, user.first_name, user.last_name, user.role, user.subscription_status, user.profile_image, user.updated_at);



        return res.json({ token });
    }

    async check(req, res) {
        // Генерация нового токена для проверки
        const token = generateJWT(
            req.user.id,
            req.user.email,
            req.user.phone,
            req.user.first_name,
            req.user.last_name,
            req.user.subscription_status,
            req.user.updatedAt
        );
        return res.json({ token });
    }

    async getOne(req, res) {
        const { id } = req.params;

        // Поиск пользователя по ID
        const user = await User.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Скрываем пароль
        user.password = '';

        return res.json(user);
    }

    async updateImage(req, res) {
        const { id } = req.params;
        const { image } = req.body;

        // Обновление аватара пользователя
        const updatedUser = await User.update({ profile_image: image }, { where: { id } });

        return res.json({ message: 'Image updated successfully', updatedUser });
    }

    async updateUser(req, res) {
        try {
            const { id, phone, email, password, first_name, last_name, subscription_status, role, profile_image, premium_end } = req.body;

            // Проверка существования пользователя
            const user = await User.findOne({ where: { id } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (profile_image && user && user.dataValues.profile_image) {
                const imageLink = user.dataValues.profile_image
                if (imageLink) {
                    const array = imageLink.split('/').reverse()
                    const imgName = array[0]
                    const filePath = path.join(__dirname, '..', 'statics', imgName);
                    await deleteFile(filePath);
                }

            }

            // Сбор обновлений
            const updates = {};
            if (email) updates.email = email;
            if (phone) updates.phone = phone;
            if (password) updates.password = await bcrypt.hash(password, 10);
            if (profile_image) updates.profile_image = profile_image;
            if (first_name) updates.first_name = first_name;
            if (last_name) updates.last_name = last_name;
            if (role) updates.role = role;
            if (premium_end) updates.premium_end = premium_end;
            if (typeof subscription_status !== 'undefined') updates.subscription_status = subscription_status;

            // Выполнение обновления
            await user.update(updates);

            // Генерация нового токена
            const token = generateJWT(
                user.id,
                user.email,
                user.phone,
                user.first_name,
                user.last_name,
                user.role,
                user.subscription_status,
                user.profile_image
            );

            return res.json({ token });
        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getAll(req, res) {
        // Получение всех пользователей
        const users = await User.findAll();

        // Скрываем пароли перед отправкой
        users.forEach((user) => {
            user.password = '';
        });

        return res.json(users);
    }

    async deleteUser(req, res) {
        const { id } = req.params;
        const user = await User.findOne({ where: { id } })
        if (user) {
            await user.destroy()
        }

        const logs = await Logs.findAll({ where: { user_id: id } })
        if (logs && logs.length) {
            for (let i in logs) {
                await logs[i].destroy()
            }
        }

        const subscription = await Subscriptions.findOne({ where: { user_id: id } })
        if (subscription) {
            await subscription.destroy()
        }

        return res.json({ message: 'User is deleted from database' })
    }
}

module.exports = new UserController();
