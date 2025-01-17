const { Content, UserLikes, UserViews } = require('../models/models');
const ApiError = require('../error/ApiError');

class ContentController {

    async create(req, res) {
        try {
            const content = await Content.create(req.body);
            res.status(201).json(content);
        } catch (error) {
            console.log(error);

            res.status(400).json({ error: error.message });
        }
    }

    async getMediaContent(req, res) {
        try {
            const contents = await Content.findAll({ where: { type: 'media' } });
            res.status(200).json(contents);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getMediaByCategory(req, res) {
        const { category } = req.params
        try {
            const contents = await Content.findAll({ where: { type: 'media', category: category } });
            res.status(200).json(contents);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const contents = await Content.findAll();
            res.status(200).json(contents);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getByCategory(req, res) {
        const { category } = req.params;
        try {
            const contents = await Content.findAll({ where: { category } });
            res.status(200).json(contents);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getOne(req, res) {
        try {
            const content = await Content.findByPk(req.params.id);
            if (!content) return res.status(404).json({ message: 'Content not found' });
            res.status(200).json(content);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const updated = await Content.update(req.body, { where: { id: req.params.id } });
            if (updated[0] === 0) return res.status(404).json({ message: 'Content not found' });
            res.status(200).json({ message: 'Content updated' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {

        const { id } = req.params

        try {
            if (id) {
                await UserLikes.destroy({ where: { content_id: id } })
                await UserViews.destroy({ where: { content_id: id } })
            }

            const deleted = await Content.destroy({ where: { id: req.params.id } });
            if (!deleted) return res.status(404).json({ message: 'Content not found' });
            res.status(200).json({ message: 'Content deleted' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }


    async getLikedContent(req, res) {

        const { user_id } = req.params

        try {
            const likes = await UserLikes.findAll({ where: { user_id } })
            const array = []
            if (likes && likes.length) {
                for (let i in likes) {
                    const item = await Content.findOne({ where: { id: likes[i].dataValues.content_id } })
                    array.push(item.dataValues)
                }
            }
            return res.json(array)
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getLikedByCategory(req, res) {

        const { user_id } = req.params
        const { category } = req.body

        try {
            const likes = await UserLikes.findAll({ where: { user_id } })

            const array = []
            if (likes && likes.length) {
                for (let i in likes) {
                    const item = await Content.findOne({ where: { id: likes[i].dataValues.content_id, category } })
                    if (item) {
                        array.push(item.dataValues)
                    }
                }
            }
            return res.json(array)
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

}

module.exports = new ContentController()