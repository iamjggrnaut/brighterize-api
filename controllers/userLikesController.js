const { UserLikes, Content, User } = require('../models/models');
const ApiError = require('../error/ApiError');

class UserLikesController {

    async create(req, res) {
        const { content_id, user_id } = req.body;

        console.log(content_id, user_id);


        try {
            // 1. Проверка существования контента
            const content = await Content.findOne({ where: { id: content_id } });
            if (!content) {
                return res.status(404).json({ error: "Контент не найден" });
            }


            // 3.  Инкрементируем likes_count для контента
            await content.increment('likes_count', { by: 1 });


            // 4. Создание записи в UserLikes
            const userLike = await UserLikes.create({
                content_id: content_id, // Важно использовать contentId, а не просто content_id
                user_id: user_id, // Важно использовать userId, а не просто user_id
            });

            // 5. Возвращаем обновленный контент
            res.status(201).json(content);
        } catch (error) {
            //  Более подробная информация об ошибке
            console.error("Ошибка при создании лайка:", error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ error: "Этот пользователь уже поставил лайк этому контенту." });
            }
            return res.status(500).json({ error: "Ошибка при создании лайка", detail: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const userLikes = await UserLikes.findAll();
            res.status(200).json(userLikes);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getOne(req, res) {
        const { user_id } = req.body
        const { content_id } = req.params
        try {
            const userLike = await UserLikes.findOne({ where: { user_id, content_id } });
            console.log(userLike);

            if (!userLike) return res.json(null);
            res.status(200).json(userLike);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const updated = await UserLikes.update(req.body, { where: { id: req.params.id } });
            if (updated[0] === 0) return res.status(404).json({ message: 'userLike not found' });
            res.status(200).json({ message: 'userLike updated' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        const { user_id } = req.body
        const { content_id } = req.params

        try {
            const content = await Content.findOne({ where: { id: content_id } });
            if (!content) {
                return res.status(404).json({ error: "Контент не найден" });
            }
            await content.decrement('likes_count', { by: 1 });

            const target = await UserLikes.findOne({ where: { content_id, user_id } })
            if (target) {
                console.log(target);
                await target.destroy()
            }
            if (!target) return res.status(404).json({ message: 'userLike not found' });
            res.status(200).json(content);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

}


module.exports = new UserLikesController()