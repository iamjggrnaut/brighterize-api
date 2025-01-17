const { Categories } = require('../models/models');
const ApiError = require('../error/ApiError');


class CategoriesControleer {

    async create(req, res) {
        try {
            const category = await Categories.create(req.body);
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const categories = await Categories.findAll();
            res.status(200).json(categories);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getOne(req, res) {
        try {
            const category = await Categories.findByPk(req.params.id);
            if (!category) return res.status(404).json({ message: 'category not found' });
            res.status(200).json(category);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const updated = await Categories.update(req.body, { where: { id: req.params.id } });
            if (updated[0] === 0) return res.status(404).json({ message: 'Category not found' });
            res.status(200).json({ message: 'Category updated' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const deleted = await Categories.destroy({ where: { id: req.params.id } });
            if (!deleted) return res.status(404).json({ message: 'Category not found' });
            res.status(200).json({ message: 'Category deleted' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

}


module.exports = new CategoriesControleer()