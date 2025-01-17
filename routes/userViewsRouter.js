const Router = require('express')
const router = new Router()
const userViewsController = require('../controllers/userViewsController')


router.post('/', userViewsController.create)
router.get('/', userViewsController.getAll)
router.get('/:id', userViewsController.getOne)
router.delete('/delete/:id', userViewsController.delete)



module.exports = router