const Router = require('express')
const router = new Router()
const categoriesController = require('../controllers/categoriesController')
const checkRoleMiddleware = require('../middleware/CheckRoleMiddleware')

router.get('/', categoriesController.getAll)
router.get('/:id', categoriesController.getOne)
router.post('/create', checkRoleMiddleware('admin'), categoriesController.create)
router.delete('/delete/:id', checkRoleMiddleware('admin'), categoriesController.delete)
router.put('/update/:id', checkRoleMiddleware('admin'), categoriesController.update)


module.exports = router