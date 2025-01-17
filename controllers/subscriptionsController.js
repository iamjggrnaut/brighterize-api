const { Subscripstions } = require('../models/models');
const ApiError = require('../error/ApiError');


class SubscripstionsController {

    async create(req, res) {
        try {
            const subscription = await Subscripstions.create(req.body);
            res.status(201).json(subscription);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const subscriptions = await Subscripstions.findAll();
            res.status(200).json(subscriptions);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getOne(req, res) {
        try {
            const subscription = await Subscripstions.findByPk(req.params.id);
            if (!subscription) return res.status(404).json({ message: 'subscription not found' });
            res.status(200).json(subscription);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const updated = await Subscripstions.update(req.body, { where: { id: req.params.id } });
            if (updated[0] === 0) return res.status(404).json({ message: 'subscription not found' });
            res.status(200).json({ message: 'subscription updated' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const deleted = await Subscripstions.destroy({ where: { id: req.params.id } });
            if (!deleted) return res.status(404).json({ message: 'subscription not found' });
            res.status(200).json({ message: 'subscription deleted' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

}


module.exports = new SubscripstionsController()