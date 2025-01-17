const { UserViews, Content } = require('../models/models');
const ApiError = require('../error/ApiError');

class UserViewsController {

    async create(req, res) {
        const { content_id, user_id } = req.body

        try {
            const viewed = await UserViews.findOne({ where: { user_id, content_id } })

            const userView = await UserViews.create(req.body);


            const content = await Content.findOne({ where: { id: content_id } })
            if (content && !viewed) {
                await content.increment('views_count', { by: 1 })
            }
            res.status(201).json(content);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const userViews = await UserViews.findAll();
            res.status(200).json(userViews);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getOne(req, res) {
        try {
            const userView = await UserViews.findByPk(req.params.id);
            if (!userView) return res.status(404).json({ message: 'userView not found' });
            res.status(200).json(userView);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const updated = await UserViews.update(req.body, { where: { id: req.params.id } });
            if (updated[0] === 0) return res.status(404).json({ message: 'userView not found' });
            res.status(200).json({ message: 'userView updated' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const deleted = await UserViews.destroy({ where: { id: req.params.id } });
            if (!deleted) return res.status(404).json({ message: 'userView not found' });
            res.status(200).json({ message: 'userView deleted' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

}


module.exports = new UserViewsController()