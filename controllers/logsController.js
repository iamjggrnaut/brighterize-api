const { Logs } = require('../models/models');
const ApiError = require('../error/ApiError');

class LogsController {

    async getAll(req, res) {
        const logs = await Logs.findAll()

        return res.json(logs)
    }

    async getLogsByUserId(req, res) {
        const { id } = req.params

        const logs = await Logs.findAll({ where: { user_id: id } })

        return res.json(logs)
    }

    async removeAllLogs(req, res) {
        const logs = await Logs.findAll()

        if (logs && logs.length) {
            for (let i in logs) {
                await logs[i].destroy()
            }
        }

        return res.json(logs)
    }

    async removeOneLog(req, res) {
        const { id } = req.params;

        const removed = await Logs.destroy({ where: { id: id } })
        return res.json(removed)
    }

}

module.exports = new LogsController();