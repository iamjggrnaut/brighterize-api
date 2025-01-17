const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/AuthMiddleware')
const checkRoleMiddleware = require('../middleware/CheckRoleMiddleware')

router.get('/', checkRoleMiddleware('admin'), userController.getAll)
router.get('/auth', authMiddleware, userController.check)
router.get('/:id', checkRoleMiddleware('admin'), userController.getOne)
// router.put('/:id', userController.updateImage)
router.put('/:id', userController.updateUser)
router.delete('/delete/:id', userController.deleteUser)
router.post('/login', userController.login)
router.post('/register/standard', userController.registerStandard)
router.post('/register-premium', userController.register)


module.exports = router