const Router = require('express')
const router = new Router()
const userLikesController = require('../controllers/userLikesController')


router.post('/', userLikesController.create)
router.get('/', userLikesController.getAll)
router.post('/:content_id', userLikesController.getOne)
router.delete('/dislike/:content_id', userLikesController.delete)



module.exports = router