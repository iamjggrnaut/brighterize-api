const Router = require('express')
const router = new Router()
const contentController = require('../controllers/contentController')
const checkRoleMiddleware = require('../middleware/CheckRoleMiddleware')

router.post('/create', checkRoleMiddleware('admin'), contentController.create)
router.put('/update/:id', checkRoleMiddleware('admin'), contentController.update)
router.delete('/delete/:id', checkRoleMiddleware('admin'), contentController.delete)
router.get('/:id', contentController.getOne)
router.get('/liked/:user_id', contentController.getLikedContent)
router.post('/liked-categories/:user_id', contentController.getLikedByCategory)
router.get('/', contentController.getAll)
router.get('/media/all', contentController.getMediaContent)
router.get('/media/category/:category', contentController.getMediaByCategory)
router.get('/categories/:category', contentController.getByCategory)



module.exports = router