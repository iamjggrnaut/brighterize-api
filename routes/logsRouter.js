const Router = require('express')
const router = new Router()
const logsController = require('../controllers/logsController')
const checkRoleMiddleware = require('../middleware/CheckRoleMiddleware')

router.get('/', checkRoleMiddleware('admin'), logsController.getAll)
router.get('/:id', checkRoleMiddleware('admin'), logsController.getLogsByUserId)
router.delete('/delete-all', checkRoleMiddleware('admin'), logsController.removeAllLogs)
router.delete('/:id', checkRoleMiddleware('admin'), logsController.removeOneLog)

module.exports = router