const express = require('express')
const { changeLimit, createLimit } = require('../controllers/limitController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router()

router.use(authMiddleware)

router.post("/new", createLimit)
router.put("/update", changeLimit)

module.exports = router