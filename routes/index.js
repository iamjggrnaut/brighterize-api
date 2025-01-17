const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const logsRouter = require('./logsRouter')
const categoriesRouter = require('./categoriesRouter')
const contentRouter = require('./contentRouter')
const userLikesRouter = require('./userLikesRouter')
const userViewsRouter = require('./userViewsRouter')

router.use('/user', userRouter)
router.use('/categories', categoriesRouter)
router.use('/logs', logsRouter)
router.use('/content', contentRouter)
router.use('/likes', userLikesRouter)
router.use('/views', userViewsRouter)

module.exports = router